# HubSpot Data Sync Service

This project performs a **one-time migration** of selected characters and locations from the [Rick and Morty API](https://rickandmortyapi.com) into HubSpot, and sets up a **one-way integration** that keeps contacts and companies in sync between a source and a mirror HubSpot account.

---

## Project Structure

```
/src              → Express server and integration endpoints
/migration        → All one-time ETL logic (Rick & Morty → HubSpot)
/data             → Temporary JSON files for inputs and results
```

---

## 1. Migration – Rick & Morty → HubSpot (One-Time)

### Goal

* Migrate all Rick & Morty characters whose `id` is a **prime number**, plus Rick Sanchez (`id = 1`)
* Migrate all **unique locations** associated with those characters
* Transform characters into **HubSpot Contacts**, and locations into **Companies**
* Automatically associate contacts to their companies

---

### Run migration step by step

#### Step 1 – Fetch characters from API

```bash
npm run step1
# Runs: node migration/fetchCharacters.js
```

#### Step 2 – Transform characters into HubSpot format

```bash
npm run step2
# Runs: node migration/transformCharacters.js
```

#### Step 3 – Transform locations into companies

```bash
npm run step3
# Runs: node migration/transformLocations.js
```

#### Step 4 – Upload contacts to HubSpot (source account)

```bash
npm run step4
# Runs: node migration/uploadContacts.js
```

#### Step 5 – Upload companies to HubSpot (source account)

```bash
npm run step5
# Runs: node migration/uploadCompanies.js
```

#### Step 6 – Map and generate contact–company associations

```bash
npm run step6
# Runs: node migration/mapAssociations.js
```

#### Step 7 – Upload associations to HubSpot

```bash
npm run step7
# Runs: node migration/uploadAssociations.js
```

---

### Required Environment Variables

Create a `.env` file in the root:

```env
HUBSPOT_MAIN=your_source_account_token
```

> These should be **HubSpot Private App tokens**.

---

## 2. Integration – HubSpot Source → Mirror (Continuous Sync)

### Goal

Every time a **contact or company is created/updated** in the source HubSpot account, it is **replicated in the mirror account**.

---

### API Endpoints (Deployed)

The backend is deployed on Render. These are the available endpoints:

```
POST https://hubspot-api-0q2z.onrender.com/api/contact   → sync contact to mirror
POST https://hubspot-api-0q2z.onrender.com/api/companie  → sync company to mirror
```

Each one:

* Searches in the mirror account by `character_id` or `location_id`
* Updates or creates the object accordingly
* Associates contacts to companies if needed

---

### Webhook Setup (HubSpot Source)

In the source HubSpot account:

1. Go to **Workflows**
2. Create a new workflow for contacts:

   * Trigger: on contact creation/update
   * Action: send webhook to `/api/contact`
3. Do the same for companies → webhook to `/api/companie`

---

### Required Environment Variables (mirror)

```env
HUBSPOT_MIRROR=your_mirror_account_token
```

---

## Deployment

The backend is already deployed on [Render](https://render.com/). You can test the sync endpoints from HubSpot workflows.

---

## Development scripts (`package.json`)

```json
"scripts": {
  "step1": "node migration/fetchCharacters.js",
  "step2": "node migration/transformCharacters.js",
  "step3": "node migration/transformLocations.js",
  "step4": "node migration/uploadContacts.js",
  "step5": "node migration/uploadCompanies.js",
  "step6": "node migration/mapAssociations.js",
  "step7": "node migration/uploadAssociations.js",
  "dev": "nodemon src/index.js"
}
```

---

## Tech Stack

* Node.js + Express
* HubSpot Private Apps (CRM API v3/v4)
* Rick and Morty Public API
* Render (deployment)
