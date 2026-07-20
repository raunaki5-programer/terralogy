"""
Enterprise ML scoring algorithms for Terralogy.
Includes: health score, soil quality, yield potential, disease risk, irrigation need.
"""

def compute_health_score(ndvi=None, ndmi=None, soil_moisture=None, temperature=None):
    """Multi-factor crop health score (0-100)"""
    scores = []
    alerts = []

    # NDVI: Normalized Difference Vegetation Index (0-1)
    if ndvi is not None:
        if ndvi >= 0.65: scores.append(95)
        elif ndvi >= 0.50: scores.append(80)
        elif ndvi >= 0.35: scores.append(60)
        elif ndvi >= 0.20: scores.append(40)
        elif ndvi >= 0.10: scores.append(20)
        else: scores.append(10); alerts.append({"type": "vegetation", "severity": "critical", "message": f"NDVI critical at {ndvi:.2f} — bare soil detected"})

    # NDMI: Normalized Difference Moisture Index
    if ndmi is not None:
        if ndmi >= 0.20: scores.append(90)
        elif ndmi >= 0.10: scores.append(75)
        elif ndmi >= 0.0: scores.append(55)
        elif ndmi >= -0.10: scores.append(35)
        else: scores.append(15); alerts.append({"type": "water", "severity": "critical", "message": f"NDMI critical at {ndmi:.2f} — severe water stress"})

    # Soil moisture (0-1)
    if soil_moisture is not None:
        if soil_moisture >= 0.25: scores.append(90)
        elif soil_moisture >= 0.18: scores.append(75)
        elif soil_moisture >= 0.12: scores.append(55)
        elif soil_moisture >= 0.08: scores.append(35)
        else: scores.append(15); alerts.append({"type": "irrigation", "severity": "critical", "message": f"Soil moisture critical at {soil_moisture*100:.0f}% — irrigate immediately"})

    # Temperature (°C)
    if temperature is not None:
        if 20 <= temperature <= 30: scores.append(90)
        elif 15 <= temperature < 20 or 30 < temperature <= 35: scores.append(70)
        elif 10 <= temperature < 15 or 35 < temperature <= 40: scores.append(40)
        elif temperature > 40: scores.append(15); alerts.append({"type": "weather", "severity": "critical", "message": f"Extreme heat {temperature}°C — crop damage risk"})
        elif temperature < 10: scores.append(25); alerts.append({"type": "weather", "severity": "warning", "message": f"Cold stress at {temperature}°C — frost risk"})

    if not scores:
        return {"status": "unknown", "label": "No Data", "score": 0, "alerts": alerts}

    avg = sum(scores) / len(scores)
    if avg >= 75: status, label = "good", "Healthy"
    elif avg >= 50: status, label = "warning", "Fair"
    elif avg >= 25: status, label = "critical", "Stressed"
    else: status, label = "severe", "Critical"

    return {"status": status, "label": label, "score": round(avg), "alerts": alerts}


def compute_soil_score(ph=None, soc=None, clay=None, nitrogen=None):
    """Soil quality scoring (0-100)"""
    scores = []

    if ph is not None:
        if 6.0 <= ph <= 7.2: scores.append(90)
        elif 5.5 <= ph < 6.0 or 7.2 < ph <= 7.8: scores.append(65)
        elif 5.0 <= ph < 5.5 or 7.8 < ph <= 8.5: scores.append(35)
        else: scores.append(15)

    if soc is not None:
        if soc >= 1.5: scores.append(90)
        elif soc >= 1.0: scores.append(70)
        elif soc >= 0.6: scores.append(50)
        elif soc >= 0.3: scores.append(30)
        else: scores.append(10)

    if clay is not None:
        if 15 <= clay <= 35: scores.append(85)
        elif 10 <= clay < 15 or 35 < clay <= 45: scores.append(60)
        else: scores.append(35)

    if nitrogen is not None:
        if nitrogen >= 0.3: scores.append(85)
        elif nitrogen >= 0.15: scores.append(60)
        elif nitrogen >= 0.08: scores.append(35)
        else: scores.append(15)

    if not scores:
        return {"score": 0, "label": "Unknown", "recommendation": "No soil data available."}

    avg = sum(scores) / len(scores)
    if avg >= 70: label, rec = "Excellent", "Soil quality is optimal for cultivation."
    elif avg >= 50: label, rec = "Good", "Minor amendments recommended for optimal yield."
    elif avg >= 30: label, rec = "Fair", "Soil needs significant amendments. Consider liming or composting."
    else: label, rec = "Poor", "Soil is severely degraded. Major restoration required."

    return {"score": round(avg), "label": label, "recommendation": rec}


def compute_yield_potential(ndvi=None, soil_moisture=None, soil_quality=None, temperature=None):
    """Estimated yield potential (tons/hectare) based on multi-factor model"""
    base_yield = 3.0

    if ndvi is not None:
        if ndvi >= 0.65: base_yield += 2.5
        elif ndvi >= 0.50: base_yield += 2.0
        elif ndvi >= 0.35: base_yield += 1.0
        elif ndvi >= 0.20: base_yield += 0.0
        else: base_yield -= 1.0

    if soil_moisture is not None:
        if soil_moisture >= 0.20: base_yield += 1.5
        elif soil_moisture >= 0.12: base_yield += 0.5
        else: base_yield -= 0.5

    if soil_quality is not None:
        if soil_quality >= 70: base_yield += 1.5
        elif soil_quality >= 50: base_yield += 0.5
        else: base_yield -= 0.5

    if temperature is not None:
        if 20 <= temperature <= 30: base_yield += 1.0
        elif 35 < temperature <= 40: base_yield -= 1.0
        elif temperature > 40: base_yield -= 2.0

    yield_val = max(0.5, round(base_yield, 1))

    if yield_val >= 6.0: rating = "Excellent"
    elif yield_val >= 4.5: rating = "Good"
    elif yield_val >= 3.0: rating = "Average"
    elif yield_val >= 2.0: rating = "Below Average"
    else: rating = "Poor"

    return {"estimated_tons_ha": yield_val, "rating": rating}


def compute_disease_risk(temperature=None, humidity=None, ndvi=None, crop_type=None):
    """Disease risk assessment based on environmental conditions"""
    risk_factors = []
    diseases = []

    if humidity is not None and temperature is not None:
        if humidity > 85 and temperature > 22:
            risk_factors.append(80)
            diseases.append({"disease": "Fungal Blight", "probability": "High", "trigger": f"Humidity {humidity}% + Temp {temperature}°C", "remedy": "Apply copper-based fungicide. Improve air circulation."})
        elif humidity > 75 and temperature > 25:
            risk_factors.append(50)
            diseases.append({"disease": "Powdery Mildew", "probability": "Medium", "trigger": f"Humidity {humidity}% + Temp {temperature}°C", "remedy": "Apply sulfur-based fungicide. Avoid overhead irrigation."})
        elif humidity > 70:
            risk_factors.append(25)
            diseases.append({"disease": "Leaf Spot", "probability": "Low", "trigger": f"Humidity {humidity}%", "remedy": "Monitor closely. Crop rotation recommended."})

    if ndvi is not None and ndvi < 0.3:
        risk_factors.append(60)
        diseases.append({"disease": "General Decline", "probability": "Medium", "trigger": f"Low NDVI {ndvi:.2f}", "remedy": "Check for pests, nutrient deficiency, or root damage."})

    overall_risk = round(sum(risk_factors) / max(len(risk_factors), 1))
    if overall_risk >= 60: risk_level = "High"
    elif overall_risk >= 30: risk_level = "Medium"
    else: risk_level = "Low"

    return {"risk_score": overall_risk, "risk_level": risk_level, "potential_diseases": diseases}


def compute_irrigation_need(soil_moisture=None, temperature=None, precipitation_forecast=None):
    """Irrigation recommendation in mm/day"""
    base_need = 5  # mm/day

    if soil_moisture is not None:
        if soil_moisture >= 0.25: return {"need_mm": 0, "urgency": "None", "message": "Soil moisture adequate. No irrigation needed."}
        elif soil_moisture >= 0.18: base_need += 2
        elif soil_moisture >= 0.12: base_need += 5
        elif soil_moisture >= 0.08: base_need += 8
        else: base_need += 12

    if temperature is not None:
        if temperature > 35: base_need += 5
        elif temperature > 30: base_need += 3

    if precipitation_forecast is not None and precipitation_forecast > 0:
        base_need = max(0, base_need - precipitation_forecast * 0.7)

    base_need = round(base_need, 1)
    if base_need == 0: urgency, msg = "None", "No irrigation needed."
    elif base_need <= 5: urgency, msg = "Low", f"Light irrigation of {base_need}mm."
    elif base_need <= 10: urgency, msg = "Medium", f"Moderate irrigation of {base_need}mm."
    else: urgency, msg = "High", f"Heavy irrigation needed: {base_need}mm."

    return {"need_mm": base_need, "urgency": urgency, "message": msg}
