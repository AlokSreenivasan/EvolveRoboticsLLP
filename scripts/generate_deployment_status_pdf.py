from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


OUTPUT_PATH = "docs/Evolve-Deployment-Status-Report-2026-07-28.pdf"


TITLE = "Evolve Mobile Deployment Status Report"
SUBTITLE = "Android + iOS pre-release review"


SECTIONS = [
    (
        "Executive Status",
        [
            "Current recommendation: NO-GO for production store submission.",
            "Feature completeness is strong, but store compliance and release plumbing block launch.",
            "Core app health: TypeScript passes, app tests pass (76), functions tests pass (49).",
            "Blocking quality/security checks: ESLint has errors and npm audit reports critical issues.",
        ],
    ),
    (
        "Validated Build/Test Snapshot",
        [
            "TypeScript: PASS (npx tsc --noEmit).",
            "App tests: PASS (13 suites, 76 tests).",
            "Functions tests: PASS (2 suites, 49 tests).",
            "ESLint: FAIL (7 errors, 8 warnings).",
            "npm audit: FAIL (27 vulnerabilities: 4 critical, 10 high, 12 moderate, 1 low).",
        ],
    ),
    (
        "Critical Issues (Must Fix Before Release)",
        [
            "Privacy Policy and Terms rows in settings are non-functional (no onPress).",
            "iOS AppIcon set has no image filenames mapped (including 1024x1024 marketing icon).",
            "iOS DEVELOPMENT_TEAM is not configured in Xcode project.",
            "Android release requires keystore.properties; currently missing in workspace.",
            "Version inconsistency: package.json=0.0.1, native build=1.0/1, Settings UI=2.1.1.",
        ],
    ),
    (
        "High Priority Issues",
        [
            "No CI/CD pipeline (no GitHub workflows, no Fastlane, no EAS config).",
            "Critical toolchain vulnerability in @react-native-community/cli (<19.1.2).",
            "Release minification disabled on Android (enableProguardInReleaseBuilds=false).",
            "Both package-lock.json and yarn.lock are committed (install drift risk).",
            "No crash telemetry stack (Crashlytics/Sentry) for production observability.",
        ],
    ),
    (
        "Medium / Risk Items",
        [
            "PDF viewer routes documents through docs.google.com/gview (third-party exposure risk).",
            "PII caching in AsyncStorage should be reviewed against policy and threat model.",
            "Firebase service config files are committed (expected for RN, but key restrictions are mandatory).",
            "Floating Android dependency androidx.activity:1.9.+ can cause non-deterministic builds.",
            "New Architecture is enabled; must complete full real-device smoke cycle pre-ship.",
        ],
    ),
    (
        "Platform Readiness",
        [
            "Android: closer to release; launcher assets present and signing flow exists.",
            "Android blockers: keystore.properties, lint/audit cleanup, privacy/terms URL wiring, version alignment.",
            "iOS: packaging blockers are significant (icons + DEVELOPMENT_TEAM).",
            "iOS blockers: AppIcon mapping, team signing, privacy/terms URL wiring, version alignment.",
        ],
    ),
    (
        "Recommended Fix Plan (Priority Order)",
        [
            "1) Wire Privacy Policy and Terms to public HTTPS pages and test navigation.",
            "2) Populate all iOS app icon sizes and set DEVELOPMENT_TEAM.",
            "3) Align app versions across package.json, Android, iOS, and settings/about screens.",
            "4) Provide release signing artifacts (keystore.properties + keystore) and verify release builds.",
            "5) Fix all ESLint errors and update vulnerable CLI dependencies (>=19.1.2).",
            "6) Choose one lockfile strategy (npm or yarn) and remove the other.",
            "7) Add CI workflow: lint + tsc + jest + rules tests + functions tests.",
            "8) Add crash/error telemetry and complete store privacy/data safety forms.",
        ],
    ),
    (
        "Definition of Release Ready",
        [
            "All critical blockers closed and verified on both platforms.",
            "Quality gates green in CI on every merge to main.",
            "Store assets and legal links validated in production build.",
            "Security and dependency risk accepted or remediated with documented sign-off.",
            "Smoke test checklist complete on real devices for login, notifications, media, PDFs, and quizzes.",
        ],
    ),
]


def draw_header(pdf: canvas.Canvas, page_no: int) -> float:
    width, height = A4
    y = height - 2.0 * cm
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2.0 * cm, y, TITLE)
    y -= 0.6 * cm
    pdf.setFont("Helvetica", 11)
    pdf.drawString(2.0 * cm, y, SUBTITLE)
    pdf.drawRightString(
        width - 2.0 * cm, y, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    )
    y -= 0.5 * cm
    pdf.line(2.0 * cm, y, width - 2.0 * cm, y)
    pdf.setFont("Helvetica", 9)
    pdf.drawRightString(width - 2.0 * cm, 1.5 * cm, f"Page {page_no}")
    return y - 0.8 * cm


def ensure_space(pdf: canvas.Canvas, y: float, required: float, page_no: int) -> tuple[float, int]:
    if y - required > 2.5 * cm:
        return y, page_no
    pdf.showPage()
    page_no += 1
    y = draw_header(pdf, page_no)
    return y, page_no


def build_pdf() -> None:
    pdf = canvas.Canvas(OUTPUT_PATH, pagesize=A4)
    page_no = 1
    y = draw_header(pdf, page_no)

    width, _ = A4
    body_width = width - 4.0 * cm
    bullet_indent = 2.5 * cm
    line_height = 0.5 * cm

    for heading, points in SECTIONS:
        y, page_no = ensure_space(pdf, y, 1.2 * cm, page_no)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(2.0 * cm, y, heading)
        y -= 0.7 * cm

        pdf.setFont("Helvetica", 10.5)
        for point in points:
            words = point.split()
            current = ""
            lines: list[str] = []
            for word in words:
                candidate = f"{current} {word}".strip()
                if pdf.stringWidth(candidate, "Helvetica", 10.5) <= body_width - 0.8 * cm:
                    current = candidate
                else:
                    lines.append(current)
                    current = word
            if current:
                lines.append(current)

            needed = line_height * max(1, len(lines))
            y, page_no = ensure_space(pdf, y, needed + 0.2 * cm, page_no)

            if lines:
                pdf.drawString(2.0 * cm, y, u"\u2022")
                pdf.drawString(bullet_indent, y, lines[0])
                y -= line_height
                for line in lines[1:]:
                    pdf.drawString(bullet_indent, y, line)
                    y -= line_height
            y -= 0.05 * cm

        y -= 0.35 * cm

    pdf.save()


if __name__ == "__main__":
    build_pdf()
