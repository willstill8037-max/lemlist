#!/usr/bin/env python3
"""Technical analysis of the reference soundtrack (no listening involved).

Outputs (docs/analysis/):
  audio_onsets.csv       every detected onset: time, frame (60 fps), strength,
                         dominant band, broadband ratio (whoosh/impact hint)
  audio_envelope.csv     RMS (dBFS) per 100 ms + band energies
  audio_tempo.txt        tempo estimate from the onset autocorrelation
  audio_overview.png     spectrogram + band envelopes + onsets + scene cuts

Requirements: numpy, scipy, matplotlib (see tools/requirements.txt).
Usage: python tools/analyze_audio.py reference/lemlist_1080p.mp4
"""
import os, sys, json, subprocess, wave
import numpy as np
import scipy.signal as ss
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'reference', 'lemlist_1080p.mp4')
out = os.path.join(ROOT, 'docs', 'analysis')
os.makedirs(out, exist_ok=True)
tmp = os.path.join(out, '_tmp_audio.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', tmp], check=True)
w = wave.open(tmp); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close()
os.remove(tmp)

hop, win = 480, 2048  # 10 ms hop
f, t, Z = ss.stft(x, fs=sr, nperseg=win, noverlap=win - hop, boundary=None)
S = np.abs(Z) + 1e-9
def band(lo, hi):
    m = (f >= lo) & (f < hi)
    return 20 * np.log10(np.sqrt((S[m] ** 2).mean(axis=0)))
bands = {'sub_20_120': band(20, 120), 'low_120_400': band(120, 400), 'mid_400_3k': band(400, 3000), 'high_3k_8k': band(3000, 8000), 'air_8k_16k': band(8000, 16000)}
rms = 20 * np.log10(np.sqrt(ss.convolve(x ** 2, np.ones(hop) / hop, mode='same')[::hop][:len(t)]) + 1e-9)

# spectral flux onset strength (log-compressed), per band
L = np.log1p(S * 1000)
D = np.maximum(0, np.diff(L, axis=1)); D = np.concatenate([np.zeros((D.shape[0], 1)), D], axis=1)
flux = D.sum(axis=0)
flux_low = D[f < 200].sum(axis=0); flux_mid = D[(f >= 200) & (f < 3000)].sum(axis=0); flux_high = D[f >= 3000].sum(axis=0)
env = flux / flux.max()
# adaptive threshold peak picking
med = ss.medfilt(env, 51)
peaks, props = ss.find_peaks(env, height=med + 0.06, distance=6)
rows = []
for p in peaks:
    tot = flux_low[p] + flux_mid[p] + flux_high[p] + 1e-9
    shares = {'low': flux_low[p] / tot, 'mid': flux_mid[p] / tot, 'high': flux_high[p] / tot}
    dom = max(shares, key=shares.get)
    rows.append((t[p], int(round(t[p] * 60)), env[p], dom, shares['low'], shares['high']))
with open(os.path.join(out, 'audio_onsets.csv'), 'w') as fh:
    fh.write('time_s,frame_60fps,strength,dominant_band,low_share,high_share\n')
    for r in rows:
        fh.write('%.3f,%d,%.3f,%s,%.2f,%.2f\n' % r)
with open(os.path.join(out, 'audio_envelope.csv'), 'w') as fh:
    fh.write('time_s,rms_dbfs,' + ','.join(bands) + '\n')
    for i in range(0, len(t), 10):
        fh.write('%.2f,%.1f,%s\n' % (t[i], rms[i], ','.join('%.1f' % bands[k][i] for k in bands)))
# tempo: autocorrelation of the low-band onset envelope between 70 and 180 BPM
e = flux_low - ss.medfilt(flux_low, 31); e = np.maximum(e, 0)
ac = np.correlate(e, e, 'full')[len(e) - 1:]
lags = np.arange(len(ac)) * hop / sr
m = (lags > 60 / 180) & (lags < 60 / 70)
best = lags[m][np.argmax(ac[m])]
with open(os.path.join(out, 'audio_tempo.txt'), 'w') as fh:
    fh.write('Tempo estimate (low-band onset autocorrelation): %.1f BPM (beat period %.3f s = %.1f frames @60fps)\n' % (60 / best, best, best * 60))
    fh.write('Half-time / double-time alternatives: %.1f / %.1f BPM\n' % (30 / best, 120 / best))

# overview figure
cuts = []
tl = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
cuts = [(s['in'] / 60, s['id']) for s in tl['scenes']]
fig, axs = plt.subplots(4, 1, figsize=(26, 14), sharex=True, gridspec_kw={'height_ratios': [3, 1.2, 1.2, 0.5]})
fm = f <= 12000
axs[0].pcolormesh(t, f[fm], 20 * np.log10(S[fm]), shading='auto', cmap='magma', vmin=-100, vmax=-15)
axs[0].set_yscale('symlog', linthresh=400); axs[0].set_ylim(30, 12000); axs[0].set_ylabel('Hz')
for k, v in bands.items(): axs[1].plot(t, ss.medfilt(v, 5), lw=0.8, label=k)
axs[1].legend(loc='lower left', ncol=5, fontsize=8); axs[1].set_ylabel('dB')
axs[2].plot(t, env, 'k', lw=0.6); axs[2].plot(t[peaks], env[peaks], 'r.', ms=4); axs[2].set_ylabel('onset')
for c, sid in cuts:
    for ax in axs[:3]: ax.axvline(c, color='c', lw=0.6, alpha=0.7)
    axs[3].text(c, 0.5, sid, fontsize=7, rotation=90, va='center')
axs[3].set_yticks([]); axs[3].set_xlabel('seconds'); axs[3].set_xlim(0, t[-1])
axs[3].set_xticks(np.arange(0, 52, 1))
plt.tight_layout(); plt.savefig(os.path.join(out, 'audio_overview.png'), dpi=60); plt.close()
print('onsets:', len(rows), '| tempo:', open(os.path.join(out, 'audio_tempo.txt')).read().strip())
