"""
FIREWISE-X Scientific PDF Report Generator (Module 5)
Generates publication-quality PDF investigation reports adhering to the 9-part structure:
1. Experiment information
2. Input conditions
3. Video analysis
4. Flame characteristics
5. AI prediction
6. Model explanation
7. Experimental comparison
8. Uncertainty and limitations
9. References
"""

import os
import io
import json

BASE_DIR = r"d:\nasa fire"
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")
os.makedirs(DATA_DIR, exist_ok=True)
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

def build_pdf_report(report_data: dict) -> bytes:
    """Generate in-memory PDF bytes matching NASA technical report formatting."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom color palette
    c_primary = colors.HexColor("#0A192F")
    c_accent = colors.HexColor("#0284C7")
    c_orange = colors.HexColor("#EA580C")
    c_text = colors.HexColor("#1E293B")
    c_bg_light = colors.HexColor("#F8FAFC")

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=c_primary,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=c_accent,
        spaceAfter=14
    )

    h2_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_text
    )

    bold_body = ParagraphStyle(
        "ReportBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold"
    )

    callout_style = ParagraphStyle(
        "Callout",
        parent=body_style,
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569")
    )

    story = []

    # Header / Title Block
    story.append(Paragraph("FIREWISE-X | Microgravity Combustion Intelligence", subtitle_style))
    story.append(Paragraph(f"Scientific Investigation Report: {report_data.get('title', 'Combustion Assessment')}", title_style))
    story.append(Paragraph(f"<b>Report ID:</b> {report_data.get('report_id', 'FWX-2026-001')} | <b>Generated:</b> {report_data.get('timestamp', '2026-11-09')} | <b>Facility:</b> ISS MSG / PSI-25", callout_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_accent, spaceBefore=6, spaceAfter=12))

    # 1. Experiment Information
    story.append(Paragraph("1. Experiment Information", h2_style))
    exp_info = report_data.get("experiment_info", {})
    t1_data = [
        [Paragraph("<b>Investigation</b>", bold_body), Paragraph(exp_info.get("investigation", "NASA PSI-25 (BASS-II)"), body_style),
         Paragraph("<b>Principal Investigator</b>", bold_body), Paragraph(exp_info.get("pi", "S. Bhattacharjee et al."), body_style)],
        [Paragraph("<b>Test Identifier</b>", bold_body), Paragraph(exp_info.get("test_id", "B1 / Scenario Alpha"), body_style),
         Paragraph("<b>Flight Date / GMT</b>", bold_body), Paragraph(f"{exp_info.get('date', '2014-02-19')} (GMT {exp_info.get('gmt', '050')})", body_style)],
        [Paragraph("<b>Combustion Hardware</b>", bold_body), Paragraph("Microgravity Science Glovebox Flow Duct", body_style),
         Paragraph("<b>Pressure Regime</b>", bold_body), Paragraph("1.0 atm (Cabin Baseline)", body_style)]
    ]
    t1 = Table(t1_data, colWidths=[120, 150, 120, 140])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t1)
    story.append(Spacer(1, 10))

    # 2. Input Conditions
    story.append(Paragraph("2. Input Conditions & Parameters", h2_style))
    inputs = report_data.get("input_conditions", {})
    t2_data = [
        [Paragraph("<b>Fuel Sample Material</b>", bold_body), Paragraph(str(inputs.get("material", "PMMA Thin Film")), body_style),
         Paragraph("<b>Fuel Thickness</b>", bold_body), Paragraph(f"{inputs.get('thickness_mm', 0.2)} mm", body_style)],
        [Paragraph("<b>Flow Geometry</b>", bold_body), Paragraph(str(inputs.get("flow_geometry", "Opposed Flow")), body_style),
         Paragraph("<b>Sample Width</b>", bold_body), Paragraph(f"{inputs.get('width_cm', 2.0)} cm", body_style)],
        [Paragraph("<b>Airflow Velocity</b>", bold_body), Paragraph(f"{inputs.get('airflow_velocity_cm_s', 5.0)} cm/s", body_style),
         Paragraph("<b>Flow Restrictor Plate</b>", bold_body), Paragraph(f"Type {inputs.get('flow_restrictor', 2)}", body_style)],
        [Paragraph("<b>Initial Ambient O₂</b>", bold_body), Paragraph(f"{inputs.get('oxygen_vol_pct', 21.0)}% by volume", body_style),
         Paragraph("<b>Radiometer Gain</b>", bold_body), Paragraph(str(inputs.get("radiometer_gain", "50")), body_style)]
    ]
    t2 = Table(t2_data, colWidths=[120, 150, 120, 140])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

    # 3. Video Analysis & 4. Flame Characteristics
    story.append(Paragraph("3. Video Analysis & 4. Flame Characteristics", h2_style))
    flame_c = report_data.get("flame_characteristics", {})
    t3_data = [
        [Paragraph("<b>Peak Segmented Flame Area</b>", bold_body), Paragraph(f"{flame_c.get('peak_flame_area_cm2', 33.0)} cm²", body_style),
         Paragraph("<b>Average Flame Area</b>", bold_body), Paragraph(f"{flame_c.get('avg_flame_area_cm2', 18.5)} cm²", body_style)],
        [Paragraph("<b>Aspect Ratio (L/W)</b>", bold_body), Paragraph(f"{flame_c.get('aspect_ratio', 1.8)}", body_style),
         Paragraph("<b>Flame Stability Mode</b>", bold_body), Paragraph(flame_c.get("stability", "Stable Hemispherical"), body_style)],
        [Paragraph("<b>Visible Extinction Timestamp</b>", bold_body), Paragraph(f"t = {flame_c.get('extinction_time_s', 'N/A')} s", body_style),
         Paragraph("<b>Peak Flame Front Velocity</b>", bold_body), Paragraph(f"{flame_c.get('front_velocity_cm_s', 0.12)} cm/s", body_style)]
    ]
    t3 = Table(t3_data, colWidths=[140, 130, 130, 130])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t3)
    story.append(Spacer(1, 10))

    # 5. AI Prediction & 6. Model Explanation
    story.append(Paragraph("5. AI Model Prediction & 6. Model Explanation", h2_style))
    pred = report_data.get("prediction", {})
    story.append(Paragraph(f"<b>Predicted Combustion Outcome:</b> <font color='#EA580C'><b>{pred.get('outcome_label', 'Radiative Quenching Extinction')}</b></font> (Confidence: {pred.get('confidence', 0.88)*100:.1f}%)", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Predicted Burn Duration:</b> {pred.get('predicted_duration_s', 45.0)} s | <b>Spread Rate:</b> {pred.get('predicted_spread_rate_cm_s', 0.08)} ± {pred.get('predicted_spread_rate_uncertainty', 0.04)} cm/s | <b>Expected ΔCO:</b> {pred.get('predicted_co_delta_ppm', 25.0)} ppm", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Scientific Rationale:</b> {pred.get('scientific_rationale', 'At the evaluated conditions, lack of natural buoyancy leads to soot accumulation and high radiative emission, exceeding the chemical reaction rate.')}", callout_style))
    story.append(Spacer(1, 10))

    # 7. Experimental Comparison
    story.append(Paragraph("7. Comparison Against NASA Flight Benchmarks", h2_style))
    comp = report_data.get("comparison", {})
    benchmarks = comp.get("closest_nasa_experiments", [])
    if benchmarks:
        tb_data = [
            [Paragraph("<b>Test ID</b>", bold_body), Paragraph("<b>PI / Material</b>", bold_body), Paragraph("<b>Flow / O₂</b>", bold_body), Paragraph("<b>Observed Outcome</b>", bold_body), Paragraph("<b>Match</b>", bold_body)]
        ]
        for b in benchmarks[:3]:
            tb_data.append([
                Paragraph(b.get("test_id", "B1"), body_style),
                Paragraph(f"{b.get('pi', '')}<br/>{b.get('material', '')[:25]}", body_style),
                Paragraph(f"{b.get('actual_airflow', 5)} cm/s<br/>{b.get('actual_o2', 21)}% O₂", body_style),
                Paragraph(f"{b.get('actual_outcome', '')}<br/><i>{b.get('observations', '')[:40]}...</i>", callout_style),
                Paragraph(f"{int(b.get('similarity_score', 0.9)*100)}%", body_style)
            ])
        tb = Table(tb_data, colWidths=[55, 150, 85, 185, 55])
        tb.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(tb)
    else:
        story.append(Paragraph("No direct benchmark tests isolated.", body_style))

    story.append(Spacer(1, 10))

    # 8. Uncertainty and Limitations
    story.append(Paragraph("8. Scientific Uncertainty and Operational Limitations", h2_style))
    story.append(Paragraph(
        "• Model predictions represent computational interpolations grounded in 129 physical tests from the NASA PSI-25 database.<br/>"
        "• Experimental data was gathered inside a 7.6 cm duct in the MSG at 1 atm. Scaling to larger spacecraft cabin volumes involves convective Reynolds number effects.<br/>"
        "• <b>SAFETY MANDATE:</b> FIREWISE-X is a scientific research prototype and must never override NASA spacecraft fire safety flight rules or autonomous suppression interlocks.",
        callout_style
    ))
    story.append(Spacer(1, 10))

    # 9. References
    story.append(Paragraph("9. Scientific References & Provenance", h2_style))
    story.append(Paragraph(
        "1. Olson, S.L., Ferkul, P.V., Bhattacharjee, S., Miller, F.J., Fernandez-Pello, C., T'ien, J.S., Wichman, I. (2021). "
        "<i>Burning and Suppression of Solids-II (BASS-II) Summary Report</i>. NASA/TM-20210011385.<br/>"
        "2. Bhattacharjee, S., et al. (2016). Critical flow velocity for radiative extinction in opposed-flow flame spread in microgravity.<br/>"
        "3. NASA Physical Science Informatics (PSI-25) Combustion Repository.",
        ParagraphStyle("Refs", parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor("#64748B"))
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

if __name__ == "__main__":
    sample_data = {
        "title": "BASS-II Opposed Flow PMMA Thin Film Assessment",
        "report_id": "FWX-BASS-B1-2026",
        "timestamp": "2026-11-09 17:00 UTC",
        "experiment_info": {
            "investigation": "NASA PSI-25 (BASS-II)",
            "pi": "S. Bhattacharjee",
            "test_id": "B1",
            "date": "2014-02-19",
            "gmt": "050"
        },
        "input_conditions": {
            "material": "100-µm PMMA film, 2 cm wide",
            "thickness_mm": 0.1,
            "width_cm": 2.0,
            "flow_geometry": "Opposed Flow",
            "airflow_velocity_cm_s": 5.0,
            "flow_restrictor": 2,
            "oxygen_vol_pct": 22.2,
            "radiometer_gain": "50"
        },
        "flame_characteristics": {
            "peak_flame_area_cm2": 33.02,
            "avg_flame_area_cm2": 19.45,
            "aspect_ratio": 1.75,
            "stability": "Stable Blue/Sooty",
            "extinction_time_s": 42.5,
            "front_velocity_cm_s": 0.14
        },
        "prediction": {
            "outcome_label": "Radiative Quenching Extinction",
            "confidence": 0.92,
            "predicted_duration_s": 44.8,
            "predicted_spread_rate_cm_s": 0.12,
            "predicted_spread_rate_uncertainty": 0.03,
            "predicted_co_delta_ppm": 6.0,
            "scientific_rationale": "Quenched rapidly when ventilation flow was throttled down below critical extinction threshold."
        },
        "comparison": {
            "closest_nasa_experiments": [
                {
                    "test_id": "B1",
                    "pi": "Bhattacharjee",
                    "material": "100-µm PMMA film",
                    "actual_airflow": 5.0,
                    "actual_o2": 22.2,
                    "actual_outcome": "extinguished_quenched",
                    "observations": "Ignited very quickly, turned flow off after spread halfway; flame extinguished very quickly",
                    "similarity_score": 0.99
                }
            ]
        }
    }
    pdf_bytes = build_pdf_report(sample_data)
    out_pdf = os.path.join(DATA_DIR, "sample_test_report.pdf")
    with open(out_pdf, "wb") as f:
        f.write(pdf_bytes)
    print(f"Generated sample PDF report ({len(pdf_bytes)} bytes) at {out_pdf}")
