import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cors from "cors";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  note?: string;
  tags?: string;
}

interface BudgetItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
}

interface KPIStats {
  id: number;
  totalBalance: number;
  monthlyBudget: number;
}

interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextDate: string;
  category: string;
  color: string;
  status: string;
  autopay: number | boolean;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  const db = new Database("finance.db");
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      "limit" REAL NOT NULL,
      spent REAL NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recurring_bills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      frequency TEXT NOT NULL,
      nextDate TEXT NOT NULL,
      category TEXT NOT NULL,
      color TEXT NOT NULL,
      status TEXT NOT NULL,
      autopay INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kpi_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      totalBalance REAL NOT NULL,
      monthlyBudget REAL NOT NULL
    );
  `);

  // Seed data if empty
  const transactionCount = db.prepare("SELECT count(*) as count FROM transactions").get() as { count: number };
  if (transactionCount.count === 0) {
    console.log("Seeding initial data...");
    
    // We'll import initial data from mockData.ts if we were in a node environment that can read it.
    // For now, I'll just hardcode some seeds based on the mockData I saw.
    const now = new Date();
    const Y = now.getFullYear();
    const M = now.getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

    const stmt = db.prepare("INSERT INTO transactions (id, title, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run('t001', '工资', 17000, 'income', 'Salary', dateStr(Y, M, 1), '每月固定工资');
    stmt.run('t002', '房租', 3600, 'expense', 'Housing', dateStr(Y, M, 1), '房东');
    stmt.run('t003', '超市购物', 468.9, 'expense', 'Food', dateStr(Y, M, 2), null);
    
    db.prepare("INSERT INTO kpi_stats (id, totalBalance, monthlyBudget) VALUES (1, 85700.6, 8400)").run();
    
    const budgetStmt = db.prepare("INSERT INTO budgets (id, category, \"limit\", spent, color) VALUES (?, ?, ?, ?, ?)");
    budgetStmt.run('b001', 'Food', 1200, 734, '#10B981');
    budgetStmt.run('b002', 'Transport', 600, 282, '#3B82F6');
  }

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC").all() as Transaction[];
    res.json(transactions.map((t) => ({
      ...t,
      tags: t.tags ? JSON.parse(t.tags) : []
    })));
  });

  app.post("/api/transactions", (req, res) => {
    const { id, title, amount, type, category, date, note, tags } = req.body;
    db.prepare("INSERT INTO transactions (id, title, amount, type, category, date, note, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, title, amount, type, category, date, note, JSON.stringify(tags || []));
    res.status(201).json({ success: true });
  });

  app.delete("/api/transactions/:id", (req, res) => {
    db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/kpi", (req, res) => {
    const stats = db.prepare("SELECT * FROM kpi_stats WHERE id = 1").get() as KPIStats | undefined;
    const transactions = db.prepare("SELECT * FROM transactions").all() as Transaction[];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      const d = new Date(tx.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (tx.type === 'income') totalIncome += tx.amount;
        else totalExpense += tx.amount;
      }
    });

    res.json({
      ...stats,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? Number(((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)) : 0,
      budgetUsed: totalExpense
    });
  });

  app.get("/api/budgets", (req, res) => {
    const budgets = db.prepare("SELECT * FROM budgets").all() as BudgetItem[];
    res.json(budgets);
  });

  app.post("/api/budgets", (req, res) => {
    const { id, category, limit, spent, color } = req.body;
    db.prepare("INSERT INTO budgets (id, category, \"limit\", spent, color) VALUES (?, ?, ?, ?, ?)")
      .run(id, category, limit, spent || 0, color);
    res.status(201).json({ success: true });
  });

  app.get("/api/summary", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions").all() as Transaction[];
    const now = new Date();
    const summary = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      let income = 0;
      let expense = 0;
      
      transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === m && txDate.getFullYear() === y) {
          if (tx.type === 'income') income += tx.amount;
          else expense += tx.amount;
        }
      });

      summary.push({
        month: d.toLocaleString('zh-CN', { month: 'short' }),
        income,
        expense
      });
    }
    res.json(summary);
  });

  app.get("/api/recurring", (req, res) => {
    const bills = db.prepare("SELECT * FROM recurring_bills").all() as RecurringBill[];
    res.json(bills.map((b) => ({
      ...b,
      autopay: !!b.autopay
    })));
  });

  app.post("/api/recurring", (req, res) => {
    const { id, name, amount, frequency, nextDate, category, color, status, autopay } = req.body;
    db.prepare("INSERT INTO recurring_bills (id, name, amount, frequency, nextDate, category, color, status, autopay) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, amount, frequency, nextDate, category, color, status, autopay ? 1 : 0);
    res.status(201).json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
