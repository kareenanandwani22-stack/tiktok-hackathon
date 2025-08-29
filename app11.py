import os
import pandas as pd
import streamlit as st
#import sqlalchemy
from sqlalchemy import create_engine

# ---------- Supabase connection ----------
# Prefer env var; fall back to your provided URI so it "just works"
DATABASE_URL = os.getenv("DATABASE_URL","postgresql://postgres.xapomfdwyjvxgemvlboa:Tiktokhackathon123@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require")

@st.cache_data
def load_data():
    """Load data from Supabase Postgres"""
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)

        query = """
        SELECT viewer_id, display_name, account_created_ts, age_days, 
               geo_home_country, ip_country, device_hash, kyc_level,
               coins_per_transaction, num_transaction, avg_session_duration_secs,
               preferred_gift_type, cluster_id, profile_type, risk_score, risk_label
        FROM users_master
        WHERE risk_score IS NOT NULL
        """
        with engine.connect() as conn:
            df = pd.read_sql(query, conn)
        return df

    except Exception as e:
        st.error(f"Error loading data: {e}")
        return pd.DataFrame()

def generate_risk_reasons(row):
    """Generate risk reasons based on user data"""
    reasons = []
    if pd.notna(row.get('risk_score')) and row['risk_score'] > 80:
        reasons.append("high_risk_score")
    if pd.notna(row.get('age_days')) and row['age_days'] < 30:
        reasons.append("new_account")
    if pd.notna(row.get('coins_per_transaction')) and row['coins_per_transaction'] > 100:
        reasons.append("high_spending")
    if pd.notna(row.get('kyc_level')) and row['kyc_level'] == 0:
        reasons.append("unverified_account")
    if pd.notna(row.get('num_transaction')) and row['num_transaction'] > 50:
        reasons.append("frequent_transactions")
    if pd.notna(row.get('geo_home_country')) and pd.notna(row.get('ip_country')) and row['geo_home_country'] != row['ip_country']:
        reasons.append("location_mismatch")
    if pd.notna(row.get('cluster_id')):
        reasons.append(f"cluster_{row['cluster_id']}")
    return reasons

# ---------- Streamlit UI ----------
st.title("Live Stream Risk Dashboard (Supabase)")
st.write("Real-time user risk monitoring for live stream")

with st.spinner("Loading data from Supabase..."):
    df = load_data()

if df.empty:
    st.error("No data found. Please check your Supabase tables and risk backfill.")
    st.stop()

# Risk reasons
df['reasons'] = df.apply(generate_risk_reasons, axis=1)

# Sort by risk score (highest first)
df_sorted = df.sort_values(["risk_score", "viewer_id"], ascending=[False, True], na_position='last')

# Summary statistics
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Total Users", len(df_sorted))
with col2:
    st.metric("High Risk Users (>70)", int((df_sorted['risk_score'] > 70).sum()))
with col3:
    avg_risk = df_sorted['risk_score'].mean(skipna=True) if len(df_sorted) > 0 else 0
    st.metric("Average Risk Score", f"{avg_risk:.1f}")
with col4:
    max_risk = df_sorted['risk_score'].max(skipna=True) if len(df_sorted) > 0 else 0
    st.metric("Highest Risk Score", f"{0 if pd.isna(max_risk) else int(max_risk)}")

st.subheader("Risk Leaderboard")

# Display risk leaderboard
if len(df_sorted) > 0:
    display_df = df_sorted[["viewer_id", "display_name", "risk_score", "age_days", "kyc_level"]].copy()
    display_df.columns = ["Viewer ID", "Display Name", "Risk Score", "Account Age (days)", "KYC Level"]
    st.dataframe(display_df, use_container_width=True, hide_index=True)

    # Drilldown
    st.subheader("Viewer Details")
    viewer_choice = st.selectbox("Select Viewer for Drilldown", df_sorted["viewer_id"])
    if viewer_choice:
        viewer_info = df_sorted[df_sorted["viewer_id"] == viewer_choice].iloc[0]
        col1, col2 = st.columns(2)
        with col1:
            st.write("#### Basic Information")
            st.write(f"**Viewer ID:** {viewer_info['viewer_id']}")
            st.write(f"**Display Name:** {viewer_info['display_name']}")
            st.write(f"**Risk Score:** {viewer_info['risk_score']}")
            st.write(f"**Risk Label:** {viewer_info.get('risk_label','')}")
            st.write(f"**Profile Type:** {viewer_info['profile_type']}")
            st.write(f"**Cluster ID:** {viewer_info['cluster_id']}")
        with col2:
            st.write("#### Account Details")
            st.write(f"**Account Age:** {viewer_info['age_days']} days")
            st.write(f"**KYC Level:** {viewer_info['kyc_level']}")
            st.write(f"**Home Country:** {viewer_info['geo_home_country']}")
            st.write(f"**IP Country:** {viewer_info['ip_country']}")
            dh = viewer_info['device_hash']
            st.write(f"**Device Hash:** {dh[:10]}..." if isinstance(dh, str) and dh else "N/A")

        st.write("#### Transaction Information")
        col3, col4 = st.columns(2)
        with col3:
            st.write(f"**Coins per Transaction:** {viewer_info['coins_per_transaction']}")
            st.write(f"**Number of Transactions:** {viewer_info['num_transaction']}")
        with col4:
            st.write(f"**Avg Session Duration:** {viewer_info['avg_session_duration_secs']} seconds")
            st.write(f"**Preferred Gift Type:** {viewer_info['preferred_gift_type']}")

        st.write("#### Risk Analysis")
        risk_reasons = viewer_info["reasons"]
        if risk_reasons:
            st.write("**Risk Factors:**")
            for reason in risk_reasons:
                st.write(f"• {reason.replace('_', ' ').title()}")
        else:
            st.write("**Risk Factors:** None detected")
else:
    st.warning("No users found.")

# Analytics
st.subheader("Analytics Overview")
risk_ranges = ["0-30", "31-50", "51-70", "71-100"]
risk_counts = [
    len(df[(df['risk_score'] >= 0) & (df['risk_score'] <= 30)]),
    len(df[(df['risk_score'] >= 31) & (df['risk_score'] <= 50)]),
    len(df[(df['risk_score'] >= 51) & (df['risk_score'] <= 70)]),
    len(df[(df['risk_score'] >= 71) & (df['risk_score'] <= 100)])
]
risk_dist_df = pd.DataFrame({'Risk Range': risk_ranges, 'User Count': risk_counts})
st.bar_chart(risk_dist_df.set_index('Risk Range'))

all_reasons = []
for reasons_list in df['reasons']:
    all_reasons.extend(reasons_list)
if all_reasons:
    reason_counts = pd.Series(all_reasons).value_counts()
    st.bar_chart(reason_counts.head(10))