from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# -----------------------------
# Step 1: Load Data
# -----------------------------
try:
    historical_df = pd.read_csv('data/indian_city_crime_with_population_lat_lng.csv')
    predicted_df = pd.read_csv('data/predicted_crimes.csv')
    arima_csv_df = pd.read_csv('data/crime_forecast_arima.csv')

    # Standardize column names
    for df in [historical_df, predicted_df]:
        df.rename(columns={
            "year": "Year",
            "state": "State",
            "city": "City",
            "lat": "Latitude",
            "lng": "Longitude",
            "population": "Population"
        }, inplace=True)

        # Identify crime columns
        crime_cols = [c for c in df.columns if c not in ["City", "State", "Latitude", "Longitude", "Population", "Year"]]

        # Melt to long format: Crime Type | Crime Count
        df_long = df.melt(
            id_vars=["City", "State", "Latitude", "Longitude", "Population", "Year"],
            value_vars=crime_cols,
            var_name="Crime Type",
            value_name="Crime Count"
        )

        # Replace original dataframe with long format
        if df is historical_df:
            historical_df = df_long
        else:
            predicted_df = df_long

    # Drop rows with missing essential info
    for df in [historical_df, predicted_df]:
        df.dropna(subset=["City", "State", "Latitude", "Longitude", "Year", "Crime Type", "Crime Count"], inplace=True)

    print("✅ Data loaded successfully!")
    print(f"Historical rows: {len(historical_df)}, Predicted rows: {len(predicted_df)}")

except FileNotFoundError as e:
    print(f"CSV files not found: {e}")
    historical_df = pd.DataFrame()
    predicted_df = pd.DataFrame()
except Exception as e:
    print(f"Unexpected error during data loading: {e}")
    historical_df = pd.DataFrame()
    predicted_df = pd.DataFrame()

# -----------------------------
# Step 2: Helper function for filtering
# -----------------------------
def filter_data(df, state, crime_type, year):
    filtered = df.copy()
    if state and state != "All":
        filtered = filtered[filtered["State"].str.contains(state, case=False, na=False)]
    if crime_type and crime_type != "All":
        filtered = filtered[filtered["Crime Type"].str.contains(crime_type, case=False, na=False)]
    if year and year != "All":
        filtered = filtered[filtered["Year"] == int(year)]
    return filtered

def generate_arima_forecast(state, steps=3):
    state_df = historical_df[historical_df['State'].str.strip().str.lower() == state.strip().lower()].sort_values('Year')
    if state_df.empty:
        print(f"No historical data for state: {state}")
        return pd.DataFrame()
    
    ts = state_df.groupby('Year')['Crime Count'].sum().values
    if len(ts) < 3:
        last_val = ts[-1] if len(ts) > 0 else 0
        future_years = [state_df['Year'].max() + i for i in range(1, steps+1)]
        return pd.DataFrame({
            'State': state,
            'Year': future_years,
            'Predicted_Crimes': [last_val]*steps,
            'Lower_CI': [last_val]*steps,
            'Upper_CI': [last_val]*steps
        })
    
    model = ARIMA(ts, order=(1,1,1))
    model_fit = model.fit()
    forecast = model_fit.get_forecast(steps=steps)
    predicted = forecast.predicted_mean
    conf_int = forecast.conf_int()
    future_years = [state_df['Year'].max() + i for i in range(1, steps+1)]
    
    return pd.DataFrame({
        'State': state,
        'Year': future_years,
        'Predicted_Crimes': predicted,
        'Lower_CI': conf_int.iloc[:,0],
        'Upper_CI': conf_int.iloc[:,1]
    })

# -----------------------------
# Step 3: API Endpoints
# -----------------------------

@app.route('/')
def home():
    return "Welcome to the Crime Dashboard API!"

@app.route('/api/historical')
def get_historical_data():
    state = request.args.get('state')
    crime_type = request.args.get('crime_type')
    year = request.args.get('year')

    if historical_df.empty:
        return jsonify({"error": "Historical data not loaded."}), 500

    filtered = filter_data(historical_df, state, crime_type, year)

    # Map data: sum Crime Count by city/coordinates
    map_data = filtered.groupby(['City', 'Latitude', 'Longitude'], as_index=False)['Crime Count'].sum()

    # Chart data: sum Crime Count by year
    chart_data = filtered.groupby('Year', as_index=False)['Crime Count'].sum()

    return jsonify({
        "mapData": map_data.to_dict(orient='records'),
        "chartData": chart_data.to_dict(orient='records')
    })

@app.route('/api/predicted')
def get_predicted_data():
    state = request.args.get('state')
    crime_type = request.args.get('crime_type')
    year = request.args.get('year')

    if predicted_df.empty:
        return jsonify({"error": "Predicted data not loaded."}), 500

    filtered = filter_data(predicted_df, state, crime_type, year)

    # Map data: sum Crime Count by city/coordinates
    map_data = filtered.groupby(['City', 'Latitude', 'Longitude'], as_index=False)['Crime Count'].sum()

    # Chart data: sum Crime Count by year
    chart_data = filtered.groupby('Year', as_index=False)['Crime Count'].sum()

    return jsonify({
        "mapData": map_data.to_dict(orient='records'),
        "chartData": chart_data.to_dict(orient='records')
    })

@app.route('/api/arima-forecast')
def arima_forecast():
    state = request.args.get('state')  # Optional: selected state
    steps = request.args.get('steps', default=3, type=int)

    if historical_df.empty and arima_csv_df.empty:
        return jsonify({"error": "No historical or ARIMA CSV data available."}), 500

    def get_forecast_for_state(s):
        # Filter historical data
        state_hist = historical_df[historical_df['State'] == s].sort_values('Year')

        if not state_hist.empty:
            # Fit ARIMA if historical data exists
            ts = state_hist.groupby('Year')['Crime Count'].sum().values
            try:
                model = ARIMA(ts, order=(1,1,1))
                model_fit = model.fit()
                forecast = model_fit.get_forecast(steps=steps)
                predicted = forecast.predicted_mean
                conf_int = forecast.conf_int()
                future_years = [state_hist['Year'].max() + i for i in range(1, steps+1)]

                return pd.DataFrame({
                    'State': s,
                    'Year': future_years,
                    'Predicted_Crimes': predicted,
                    'Lower_CI': conf_int.iloc[:,0],
                    'Upper_CI': conf_int.iloc[:,1]
                })
            except Exception as e:
                print(f"ARIMA failed for {s}: {e}")

        # Fallback to CSV if historical or ARIMA fails
        fallback_df = arima_csv_df[arima_csv_df['State'] == s].copy()
        if not fallback_df.empty:
            return fallback_df
        else:
            return pd.DataFrame()

    if state and state != "All":
        forecast_df = get_forecast_for_state(state)
    else:
        # All states
        all_states = sorted(set(list(historical_df['State'].unique()) + list(arima_csv_df['State'].unique())))
        forecast_list = [get_forecast_for_state(s) for s in all_states]
        forecast_df = pd.concat(forecast_list, ignore_index=True)

    if forecast_df.empty:
        return jsonify({"error": "No ARIMA forecast available."}), 404

    return jsonify(forecast_df.to_dict(orient='records'))
@app.route('/api/states')
def get_states():
    if historical_df.empty:
        return jsonify([])
    states = sorted(historical_df['State'].dropna().unique().tolist())
    return jsonify(['All'] + states)

@app.route('/api/crime_types')
def get_crime_types():
    # Combine crime types from both dataframes
    if historical_df.empty or predicted_df.empty:
        # Handle cases where one or both dataframes are empty
        if not historical_df.empty:
            crime_types = historical_df['Crime Type'].dropna().unique().tolist()
        elif not predicted_df.empty:
            crime_types = predicted_df['Crime Type'].dropna().unique().tolist()
        else:
            return jsonify([])
    else:
        historical_types = historical_df['Crime Type'].dropna().unique().tolist()
        predicted_types = predicted_df['Crime Type'].dropna().unique().tolist()
        crime_types = sorted(list(set(historical_types + predicted_types)))

    return jsonify(['All'] + crime_types)

@app.route('/api/years')
def get_years():
    """Returns the combined list of years for the filter panel."""
    historical_years = sorted(historical_df['Year'].dropna().unique().tolist())
    predicted_years = sorted(predicted_df['Year'].dropna().unique().tolist())
    all_years = sorted(list(set(historical_years + predicted_years)))
    return jsonify(['All'] + all_years)

@app.route('/api/overview')
def overview():
    # Example with static numbers — replace with DB/model values
    data = [
        { "title": "Total Crimes", "value": "45,200", "trend": +5 },
        { "title": "Predicted Next Month", "value": "12,300", "trend": +2 },
        { "title": "Solved Cases", "value": "30,100", "trend": -3 },
        { "title": "Crime Rate (per 100k)", "value": "112", "trend": +1 },
    ]
    return jsonify(data)


# ------------------------------
# API: Insights (list of strings)
# ------------------------------
@app.route('/api/insights')
def insights():
    data = [
        "High crime concentration in Mumbai (1234 cases)",
        "High crime concentration in Delhi (1020 cases)",
        "High crime concentration in Bengaluru (980 cases)",
    ]
    return jsonify(data)


# ------------------------------
# API: Alerts (list of objects)
# ------------------------------
@app.route('/api/alerts')
def alerts():
    data = [
        { "type": "High", "message": "Mumbai has very high crime count (1234)" },
        { "type": "High", "message": "Delhi has very high crime count (1020)" },
        { "type": "Medium", "message": "Cyber fraud incidents rising in Pune." },
        { "type": "Low", "message": "Overall crime stable in Jaipur." },
    ]
    return jsonify(data)

# -----------------------------
# Step 4: Run Flask app
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
