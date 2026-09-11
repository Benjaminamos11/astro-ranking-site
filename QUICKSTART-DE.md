# Schnellstart 🚀 — Webseiten bauen, die schnell sind und gefunden werden

> Für alle, die gerade erst anfangen. Diese Anleitung ist auf Deutsch; der Code und
> die Kommentare bleiben Englisch (so ist es in der Programmierung üblich).

## Was ist das hier?

Ein **Skill** für Claude: ein Ordner mit Anleitungen, der Claude zum Spezialisten für
schnelle, gut auffindbare Webseiten macht. Du musst nichts davon auswendig lernen —
Claude liest es und arbeitet danach.

## 1. Installieren

Im Terminal:

```bash
git clone https://github.com/Benjaminamos11/astro-ranking-site.git \
  ~/.claude/skills/astro-ranking-site
```

Danach Claude Code einmal neu starten. Fertig.

Du kannst es auch einfach Claude sagen:
*„Installiere den Skill von https://github.com/Benjaminamos11/astro-ranking-site"*

## 2. Erste Webseite bauen

Terminal öffnen, einen Projektordner anlegen und Claude starten:

```bash
mkdir -p ~/Projekte/meine-seite
cd ~/Projekte/meine-seite
claude
```

Dann schreibst du einfach, was du willst — auf Deutsch:

> Bau mir eine Webseite für die Bäckerei meiner Mutter in Zug. Sie soll bei Google
> gefunden werden und auf dem Handy schnell laden.

Claude stellt dir zuerst **sechs Fragen**. Die wichtigste ist:
**„Nach welchem Begriff sollen Leute suchen, um diese Seite zu finden?"**
Überleg dir das vorher — zum Beispiel *„Bäckerei Zug"* oder *„Sauerteigbrot Zug"*.
Ohne diese Antwort wird die Seite schön, aber niemand findet sie.

## 3. Was dann passiert — die sieben Schritte

| Schritt | Was Claude macht |
|---|---|
| 1. Briefing | Stellt die sechs Fragen und fasst zusammen |
| 2. Aufbau | Installiert die neueste Astro-Version und richtet alles ein |
| 3. Struktur | Legt die Ordner an, damit später alles auffindbar bleibt |
| 4. Design | Macht es schön — und schreibt die Regeln in eine `CLAUDE.md` |
| 5. Google & KI | Titel, Beschreibungen, Sitemap, `llm.txt` für ChatGPT & Co. |
| 6. Prüfen | Testet alles mit einem Script und mit Lighthouse |
| 7. Messen | Search Console und Plausible einrichten |

Claude hält nach jedem Schritt an und zeigt dir, was es gemacht hat. Du musst nur
lesen und „weiter" sagen.

## 4. Wichtige Begriffe — kurz erklärt

| Wort | Was es bedeutet |
|---|---|
| **Astro** | Das Werkzeug, mit dem die Webseite gebaut wird. Macht sehr schnelle Seiten. |
| **SEO** | Alles, was dafür sorgt, dass Google die Seite findet und anzeigt. |
| **GEO** | Dasselbe für KI-Antworten (ChatGPT, Perplexity). Neu und noch wenig genutzt. |
| **Lighthouse** | Googles Geschwindigkeitstest. Ziel: 95 von 100 oder besser. |
| **Sitemap** | Eine Liste aller Seiten — damit Google nichts übersieht. |
| **`llm.txt`** | Ein Faktenblatt für KIs: wer ihr seid, was ihr anbietet. |
| **Tokens** | Die festgelegten Farben und Schriften. Damit alles gleich aussieht. |
| **`CLAUDE.md`** | Die Projektregeln. Claude liest sie bei jedem neuen Start wieder. |
| **Deploy** | Die Seite ins Internet stellen. |

## 5. Die zwei wichtigsten Gewohnheiten

**Erstens: prüfen lassen, bevor es online geht.** Sag einfach:

> Prüfe die Seite vor dem Deployment.

Claude lässt dann ein Script laufen, das alles kontrolliert: fehlende Titel, doppelte
Beschreibungen, Bilder ohne Alt-Text, fehlende Sitemap. Wenn das Script Fehler
findet, geht die Seite **nicht** online.

**Zweitens: nicht einfach annehmen, dass es live ist.** Ein `git push` bedeutet nicht
automatisch, dass die neue Version im Internet steht. Immer beim Hoster
(Vercel/Netlify) nachsehen, ob dein Commit wirklich gebaut wurde.

## 6. Passwörter und Schlüssel — eine Regel

Für Search Console und Plausible brauchst du später API-Schlüssel. Dabei gilt:

**Schlüssel und Passwörter niemals in den Chat tippen.** Du erstellst sie auf der
jeweiligen Webseite und schreibst sie selbst in die Datei `.env.local`. Die ist so
eingerichtet, dass sie nie auf GitHub landet. Claude liest sie von dort, ohne dass
sie jemals im Chat auftauchen.

## 7. Wenn etwas nicht klappt

Frag Claude — wörtlich:

> Das hat nicht funktioniert. Erklär mir wie einem Anfänger, was schiefgegangen ist
> und wie wir es lösen.

Fehler sind normal und gehören dazu. Wichtig ist nur, dass du verstehst, was
passiert — deswegen ruhig immer nachfragen:

> Erklär mir, was du gerade gemacht hast und warum.

Viel Spaß beim Bauen! 🛠️
