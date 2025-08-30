# Live Stream Risk Dashboard

## Live Demo
Access the deployed app here: [https://tiktok-hackathon.streamlit.app/](https://tiktok-hackathon.streamlit.app/)

---

## Overview
This project was developed for the TikTok Hackathon to demonstrate a real-time fraud and risk detection system for live streaming.

It monitors user behavior to detect suspicious activity based on transaction patterns, device usage, and account history. The system helps platforms identify and flag risky accounts in real time.

---

## Workflow

### Data Setup
- A dataset of 29 fake user profiles is preloaded into the database (`users_master`).
- An additional profile (User 1) is staged in `profiles_catalog` and only inserted when a gift action is triggered.

### Gift Event Trigger
- When a gift is sent, the backend inserts a record into `gift_events`.
- A database trigger copies the user’s details from `profiles_catalog` into `users_master` and applies the risk scoring logic.

### Risk Scoring
- A scoring algorithm evaluates users on factors such as:
  - High coins per minute of activity
  - Cluster-based synchronized transactions
  - Shared devices across multiple accounts
  - Very new accounts with high transaction volume
  - Low KYC verification level
- Each user is assigned a `risk_score` and `risk_label` (Low, Medium, High).

### Dashboard
- Built using **Streamlit** and connected to **Supabase (Postgres)**.
- Displays:
  - Total users, average risk score, and high-risk user count.
  - Leaderboard of users sorted by risk score.
  - Detailed drilldown view of each user’s account and activity.
  - Charts for risk score distribution and common risk factors.

---

## Tech Stack
- **Frontend/Dashboard**: Streamlit  
- **Database**: Supabase (Postgres)  
- **Backend Logic**: SQL triggers and risk scoring rules  
- **Data**: Synthetic TikTok-style user profiles  

---

## Contributors
- Phoebe Kuek  
- Kareena Nandwani  
- Luvena Liethanti  
- Michelle Halim  
- Sofeanna Y  

---

## License
This project is for educational and hackathon demonstration purposes only.
