import numpy as np
import pandas as pd
import json
import matplotlib.pyplot as plt
from flask import Flask, jsonify, request
from keras.models import load_model
import joblib
import tensorflow as tf
from flask import send_file

app = Flask(__name__)

def model_forecast(model, series, window_size, batch_size):
    speed_scaler = joblib.load('speed_scaler.joblib')
    series = speed_scaler.transform(series.reshape(-1,1))
    series = series[:,0]
    dataset = tf.data.Dataset.from_tensor_slices(series)
    dataset = dataset.window(window_size, shift=1, drop_remainder=True)
    dataset = dataset.flat_map(lambda w: w.batch(window_size))
    dataset = dataset.batch(batch_size).prefetch(1)
    forecast = model.predict(dataset)
    forecast = speed_scaler.inverse_transform(forecast.reshape(-1,1))
    forecast = forecast[:,0]
    return forecast

@app.route('/predict-with-windspeed', methods=['POST'])
def windspeed():
    number_steps = request.form['next']
    csv = request.files.getlist('files[]')[0]
    data = pd.read_csv(csv)
    x = data['Speed']
    model = load_model('./proton_speed.h5')
    forecasts = []
    x_pred = x
    for i in range(int(number_steps)):
        forecast = model_forecast(model, np.array(x_pred), 24, 1)
        forecasts.append(forecast[0])
        x_pred = x_pred[1:]
        x_pred = np.append(x_pred, forecast[0])

    x_total = np.append(x, forecasts)
    fig = plt.plot(x_total)
    plt.savefig('plot.png')
    
    plt.close()
    with open("plot.png", "rb") as img_file:
        b64_bytes = base64.b64encode(img_file.read())

        base64_string = b64_bytes.decode('utf-8')

    return jsonify({'response':base64_string})
    


@app.route('/predict-with-speed-and-field', methods=['POST'])
def speedandfield():
    scaler = joblib.load('speed_and_field.joblib')
    model = load_model('speed_and_field.h5')
    speed_scaler = joblib.load('speed_scaler.joblib')
    number_steps = request.form['next']
    csv = request.files.getlist('files[]')[0]
    data = pd.read_csv(csv)
    speed = np.array(data['speed'])
    train_scaled = scaler.transform(data)
    features = train_scaled
    feature = np.array(features)
    feature = feature[np.newaxis,:]
    predictions = []
    for i in range(int(number_steps)):
        prediction = model.predict(feature)
        next = prediction[0][0]
        prediction = speed_scaler.inverse_transform(prediction[0][0].reshape(1,-1))
        predictions.append(prediction[0][0])
        feature = feature[:,1:]
        app = np.array([feature[0][22][0], next])
        app = app.reshape(1,1,2)
        feature = np.append(feature, app)
        feature = feature.reshape(1, 24, 2)

    x_total = np.append(speed, predictions)
    fig = plt.plot(x_total)
    plt.savefig('plot.png')

    plt.close()

    with open("plot.png", "rb") as img_file:
        b64_bytes = base64.b64encode(img_file.read())

        base64_string = b64_bytes.decode('utf-8')

    return jsonify({'response':base64_string})

app.run()
