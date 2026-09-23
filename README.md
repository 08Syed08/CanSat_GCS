# CanSat_GCS
Web-based Ground Control Software for a CanSat mission, featuring real-time telemetry visualization, command status monitoring, mission control, and raw telemetry packet display.
# 🛰️ CanSat Ground Control System

A web-based **Ground Control System (GCS)** developed for monitoring and managing a CanSat mission. The system provides a mission-control interface for displaying telemetry data, monitoring mission status, viewing raw telemetry packets, and managing communication between the CanSat and the ground station.

---

## 📌 Project Overview

A CanSat is a small satellite-like system integrated into the volume of a standard can and designed to perform a defined mission while collecting and transmitting data during flight.

A Ground Control System is responsible for receiving, processing, displaying, and monitoring the information transmitted by the CanSat.

This project focuses on developing a **web-based CanSat Ground Control Software interface** that provides a centralized mission-control dashboard for monitoring the CanSat during operation.

The interface is designed with a space-mission-inspired dashboard containing telemetry monitoring, mission status, command status, and raw packet visualization.

---

## 🎯 Objectives

- Develop a web-based Ground Control System for a CanSat mission.
- Display telemetry information in an organized dashboard.
- Monitor the operational status of the CanSat.
- Display incoming raw telemetry packets.
- Provide a dedicated mission-control interface.
- Monitor command and communication status.
- Create a user-friendly interface suitable for mission monitoring.
- Establish a foundation for integrating real-time CanSat telemetry data.

---

## 🛰️ Ground Control System Features

### 📡 Telemetry Monitoring

The system is designed to display important telemetry parameters received from the CanSat.

Possible telemetry parameters include:

- Altitude
- Temperature
- Pressure
- Battery voltage
- GPS coordinates
- Latitude
- Longitude
- Speed
- Acceleration
- Mission time
- Sensor status

---

### 🎛️ Mission Control

The dashboard provides a centralized area for monitoring the current mission state of the CanSat.

The mission-control section can be used to track:

- Mission phase
- CanSat operational status
- Communication status
- Telemetry reception
- System state
- Mission events

---

### 📤 Command Status

The Ground Control System includes a section for monitoring commands exchanged between the ground station and CanSat.

Command monitoring can include:

- Command sent
- Command status
- Command acknowledgement
- Communication status
- Latest command information

---

### 📦 Raw Packet Display

The system provides a raw telemetry packet display for viewing the data received directly from the CanSat.

This is useful for:

- Debugging communication
- Verifying packet reception
- Checking packet formatting
- Identifying corrupted data
- Testing the telemetry protocol

---

## 🖥️ User Interface

The interface follows a **mission-control / space-operations dashboard** design.

The design includes:

- Dark space-themed interface
- Telemetry panels
- Mission-control dashboard
- Command status panel
- Raw packet display
- Real-time status indicators
- Structured data visualization

The interface is designed to provide important mission information at a glance.

---

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| **HTML** | Web page structure |
| **CSS** | Interface design and styling |
| **JavaScript** | Dashboard functionality and data handling |
| **Web Browser** | Ground Control interface |
| **Live Server** | Local development and testing |

---

## 🔄 System Workflow

The intended Ground Control System workflow is:

```text
CanSat Sensors
      ↓
Onboard Data Processing
      ↓
Telemetry Packet Generation
      ↓
Wireless Communication
      ↓
Ground Station
      ↓
Telemetry Data Reception
      ↓
Data Processing
      ↓
Ground Control System
      ↓
Telemetry Visualization
      ↓
Mission Monitoring
