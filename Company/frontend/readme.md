# Company Frontend
A React-based dashboard for managing Brands, Categories, Sub-Categories, and Products with a mock backend using JSON Server.

🚀 Features

Brand CRUD + logo upload

Category & Sub-Category linked to Brand

Product module with Brand → Category → SubCategory flow

Brand-specific product view (card layout)

Smart dropdown filtering


📦 Installation
npm install

Note that this dashboard uses json-server as mock backend. If you want to test it follow the following instructions

🔌 JSON Server (Mock Backend)
1. Install:
npm install -g json-server

2. Create db.json:
{
  "brands": [],
  "categories": [],
  "subCategories": [],
  "products": []
}

3. Start server:
npx json-server --watch db.json --port 3001


Mock API runs at:

http://localhost:3001

🔧 API Setup (Axios)

In api.js:

export const api = axios.create({
  baseURL: "http://localhost:3001",
});


Update baseURL once the real backend is provided.

⚠️ Notes

Do NOT push db.json to production repos. Add it to the .gitignore file.

Very important note : JSON Server is only for local development.

Frontend is already API-ready. Only update baseURL when backend is available.