# Contributing to Happiest Health Digital Twin (Team Neuron)

Thank you for your interest in contributing to the **Happiest Health Digital Twin** project! We welcome community contributions, peer reviews, algorithmic enhancements, and physiological model extensions.

---

## 1. Code of Conduct

We are committed to providing an open, inclusive, and professional environment for all contributors.
- Treat colleagues, researchers, and clinicians with mutual respect.
- Provide constructive, evidence-based feedback on pull requests and issues.
- Adhere to health data ethics, privacy compliance (DPDP Act 2023 & HIPAA), and never submit real or identifiable patient data.

---

## 2. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: 3.10 or higher (for backend ML pipeline)
- **Git**

### Local Setup
```bash
# Clone the repository
git clone https://github.com/prathamamritkar/happiest-health-digital-twin.git
cd happiest-health-digital-twin/digital-twin-app

# Install frontend dependencies
npm install

# Start local Next.js development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Backend & Synthetic Data Generation (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 3. Architecture & Coding Standards

1. **State Engine Decoupling**: All patient state, telemetry buffers, and ML inferences reside inside `context/DigitalTwinContext.tsx`. Do not create redundant, view-specific local state duplicates.
2. **Presentation Layer Polymorphism**: Ensure any new clinical feature is represented appropriately across both the **3D Spatial Digital Twin** viewport (`components/twin/Twin3DView.tsx`) and the **Clinical Telemetry Dashboard** (`components/twin/DashboardSummaryRow.tsx`, `components/twin/PatientTable.tsx`).
3. **Type Safety**: Strictly avoid `any` in TypeScript. All schemas must align with `lib/api.ts` and `backend/app/models/schemas.py`.
4. **Data Privacy**: Strictly use synthetic data generators (`scripts/generate_demo_data.py` or `lib/mockData.ts`). No proprietary, confidential, or protected health information (PHI) may ever be committed.

---

## 4. Development Workflow

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit** your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(3d-twin): add kinetic muscle GLUT4 uptake shader"
   ```
3. **Verify** build and type checks:
   ```bash
   npm run build
   ```
4. **Push** to your fork and submit a **Pull Request (PR)** targeting the `main` branch.

---

## 5. Reporting Issues & Vulnerabilities

- Open a detailed issue on GitHub including reproduction steps, expected vs. actual behavior, and browser/OS specifications.
- For security or data compliance inquiries, contact Team Leader **Pratham Amritkar** (`team.neuron.health@gmail.com`).

---

## 6. License

By contributing to this repository, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
