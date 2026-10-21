import sys
import numpy as np
import pandas as pd

if len(sys.argv) < 2:
    sys.exit("Usage: python3 check_anomalies.py file.csv [YYYY-MM-DD]")

path = sys.argv[1]
inspect_day = pd.Timestamp(sys.argv[2]) if len(sys.argv) > 2 else None

df = pd.read_csv(path)
df.columns = [c.strip() for c in df.columns]
df["Date"] = pd.to_datetime(df["Date"])
rows_in = len(df)
df = df.drop_duplicates()
df = df[(df["Quantity"] > 0) & (df["Price per Unit"] > 0) & (df["Total Amount"] > 0)]
print(f"Rows: {rows_in} in, {len(df)} after cleaning")

daily_present = df.groupby("Date")["Total Amount"].sum().sort_index()
full_index = pd.date_range(daily_present.index.min(), daily_present.index.max(), freq="D")
daily_filled = daily_present.reindex(full_index, fill_value=0.0)

print(f"Date range: {full_index[0].date()} to {full_index[-1].date()} ({len(full_index)} days)")
print(f"Days with at least one sale: {len(daily_present)}  |  days with zero sales: {len(full_index) - len(daily_present)}")
print(f"Average transactions per day: {len(df) / len(full_index):.2f}\n")


def modified_z(series, window=31, centered=False, min_periods=7):
    roll = series.rolling(window, center=centered, min_periods=min_periods)
    med = roll.median()
    mad = roll.apply(lambda w: np.median(np.abs(w - np.median(w))), raw=True)
    z = 0.6745 * (series - med) / mad.replace(0, np.nan)
    return med, z


variants = {
    "A) only days with sales, trailing 31d": (daily_present, False),
    "B) only days with sales, centered 31d": (daily_present, True),
    "C) zero-filled days, trailing 31d": (daily_filled, False),
    "D) zero-filled days, centered 31d": (daily_filled, True),
}

print(f"{'Variant':42s} {'|z|>2.0':>8s} {'|z|>3.0':>8s} {'|z|>3.5':>8s}")
results = {}
for name, (series, centered) in variants.items():
    med, z = modified_z(series, centered=centered)
    results[name] = (series, med, z)
    counts = [int((z.abs() > t).sum()) for t in (2.0, 3.0, 3.5)]
    print(f"{name:42s} {counts[0]:8d} {counts[1]:8d} {counts[2]:8d}")

if inspect_day is not None:
    print(f"\nDetail for {inspect_day.date()}:")
    for name, (series, med, z) in results.items():
        if inspect_day in series.index:
            print(f"  {name:42s} actual={series[inspect_day]:>12,.0f}  median={med[inspect_day]:>12,.0f}  z={z[inspect_day]:.2f}")
        else:
            print(f"  {name:42s} day not present in this series")


def project_style(series, window=31, min_periods=7):
    vals = series.values.astype(float)
    n = len(vals)
    half = window // 2
    expected = np.empty(n)
    for i in range(n):
        lo, hi = max(0, i - half), min(n, i + half + 1)
        w = vals[lo:hi]
        expected[i] = np.median(w) if len(w) >= min_periods else vals[i]
    resid = vals - expected
    med_resid = np.median(resid)
    mad = np.median(np.abs(resid - med_resid))
    if mad == 0:
        mad = resid.std() or 1.0
    z = 0.6745 * (resid - med_resid) / mad
    return pd.Series(expected, index=series.index), pd.Series(z, index=series.index)


print("\nProject-style method (centered 31 median, ONE global MAD of residuals):")
print(f"{'Series':42s} {'|z|>2.0':>8s} {'|z|>3.0':>8s} {'|z|>3.5':>8s}")
for label, series in (("E) only days with sales", daily_present), ("F) zero-filled days", daily_filled)):
    exp, z = project_style(series)
    counts = [int((z.abs() > t).sum()) for t in (2.0, 3.0, 3.5)]
    print(f"{label:42s} {counts[0]:8d} {counts[1]:8d} {counts[2]:8d}")
    if inspect_day is not None and inspect_day in series.index:
        print(f"    {inspect_day.date()}: actual={series[inspect_day]:,.0f} expected={exp[inspect_day]:,.0f} z={z[inspect_day]:.2f}")
