const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const moment = require("moment");
const CsvParser = require("json2csv").Parser;
const { createPDFBase64, createPDFBinary } = require("../libs/PDFController");
const BalanceSheetPDFTemplate = require("../libs/PDFController/Templates/BalanceSheetTemplate");

router.post("/get-balance", async function (req, res, next) {
  try {
    if (
      req.body.accounts &&
      req.body.accounts instanceof Array &&
      req.body.accounts.length
    ) {
      let requests = await req.body.accounts.map((account) =>
        getBalance(account)
      );
      let response = await Promise.all(requests);
      return res.send(response);
    }
    throw { details: [{ message: "Error! Invalid input data." }] };
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.post("/get-balance/csv", async function (req, res, next) {
  try {
    if (
      req.body.accounts &&
      req.body.accounts instanceof Array &&
      req.body.accounts.length
    ) {
      let requests = await req.body.accounts.map((account) =>
        getBalance(account)
      );
      let response = await Promise.all(requests);
      let csvPayload = [];
      response.forEach((obj) => {
        csvPayload.push({
          Address: obj.result.account_data.Account,
          Balance: obj.result.account_data.Balance,
          Ledger: obj.result.ledger_current_index,
          Flags: obj.result.account_data.Flags,
        });
      });
      const csvFields = ["Address", "Balance", "Ledger Index", "Flags"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(csvPayload);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=BalanceSheet.csv"
      );
      return res.status(200).end(csvData);
    }
    throw { details: [{ message: "Error! Invalid input data." }] };
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.post("/get-balance/pdf", async function (req, res, next) {
  try {
    if (
      req.body.accounts &&
      req.body.accounts instanceof Array &&
      req.body.accounts.length
    ) {
      let requests = await req.body.accounts.map((account) =>
        getBalance(account)
      );
      let response = await Promise.all(requests);
      let balanceSheetPDFDocDefinition = await BalanceSheetPDFTemplate(
        response
      );
      let pdfData = await createPDFBinary(balanceSheetPDFDocDefinition);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=BalanceSheet.pdf"
      );
      return res.status(200).end(pdfData);
    }
    throw { details: [{ message: "Error! Invalid input data." }] };
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.post("/db/connection", async function (req, res, next) {
  try {
    let { host, port, user, password } = req.body;
    let mysql = require("mysql2/promise");
    let connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
    const [rows, fields] = await connection.execute("SELECT 1 + 1 AS result");
    if (rows[0].result === 2) {
      return res
        .status(200)
        .send({ status: true, message: "Connection successful!" });
    }
    return res
      .status(400)
      .send({ status: false, message: "Authentication failed." });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.post("/db/sync", async function (req, res, next) {
  let accounts_data;
  try {
    if (
      req.body.accounts &&
      req.body.accounts instanceof Array &&
      req.body.accounts.length
    ) {
      let requests = await req.body.accounts.map((account) =>
        getBalance(account)
      );
      accounts_data = await Promise.all(requests);
    } else {
      throw {
        details: [
          { message: "Error! Please provide atleast one account adderess." },
        ],
      };
    }

    let { host, port, user, password } = req.body;
    let mysql = require("mysql2/promise");
    let connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
    const [rows, fields] = await connection.execute("SELECT 1 + 1 AS result");
    if (rows[0].result === 2) {
      await connection.execute(
        `CREATE DATABASE IF NOT EXISTS ${req.body.database}`
      );
      await connection.execute(
        `DROP TABLE IF EXISTS ${req.body.database}.${moment().format(
          "YYYYMMDDHH"
        )}`
      );
      await connection.execute(
        `CREATE TABLE ${req.body.database}.${moment().format(
          "YYYYMMDDHH"
        )} (id int NOT NULL AUTO_INCREMENT, address varchar(255), balance varchar(255), ledger_index varchar(255), flags varchar(255), PRIMARY KEY (id))`
      );
      let insert_query = `INSERT INTO ${req.body.database}.${moment().format(
        "YYYYMMDDHH"
      )} (address, balance, ledger_index, flags) values`;
      accounts_data.forEach((obj, index) => {
        insert_query += `('${obj.result.account_data.Account}', '${obj.result.account_data.Balance}', '${obj.result.ledger_current_index}', '${obj.result.account_data.Flags}')`;
        if (index !== accounts_data.length - 1) {
          insert_query += ",";
        }
      });
      await connection.execute(insert_query);
      return res.status(200).send({ status: true });
    }
    return res
      .status(400)
      .send({ status: false, message: "Authentication failed." });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.get("/transactions/:account", async function (req, res, next) {
  try {
    const payload = {
      method: "account_tx",
      params: [
        {
          account: req.params.account,
          // binary: false,
          // forward: false,
          ledger_index_max: -1,
          ledger_index_min: -1,
          limit: 15,
        },
      ],
    };
    const response = await fetch(process.env.XRPL_CLIENT_ADDRESS, {
      method: "post",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return res.send(data);
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

module.exports = router;

async function getBalance(account) {
  const payload = {
    method: "account_info",
    params: [
      {
        account: account,
        strict: true,
        // "ledger_index": "validated",
        // "api_version": 1
      },
    ],
  };

  const response = await fetch(process.env.XRPL_CLIENT_ADDRESS, {
    method: "post",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}
