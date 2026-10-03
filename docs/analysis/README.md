# Sorties d'analyse (générées)

| Fichier | Produit par | Contenu |
|---|---|---|
| `audio_overview.png` | `tools/analyze_audio.py` | spectrogramme, énergies par bande, onsets, coupes de scènes |
| `audio_onsets.csv` | idem | onsets (temps, image 60 fps, force, bande dominante) |
| `audio_envelope.csv` | idem | RMS et énergies par bande toutes les 100 ms |
| `audio_tempo.txt` | idem | tempo estimé |
| `audio_sync.txt` | `tools/audio_sync_report.py` | événements visuels ↔ onsets audio |
| `fidelity_per_frame.csv` | `tools/fidelity_metrics.py` | MAE, PSNR, edge-IoU pour chacune des 3 099 images |
| `fidelity_per_scene.csv` | idem | moyennes par scène + pire image |
| `fidelity_curve.png` | idem | courbes MAE et edge-IoU avec les coupes |
| `contact_sheets/` | `tools/contact_sheet.py` | planches référence / reconstruction aux mêmes instants |
