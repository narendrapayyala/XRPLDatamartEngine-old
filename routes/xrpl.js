const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.get("/", async function (req, res, next) {
  let data = await getBalance("rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn");
  res.send(data);
});

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

router.get("/transactions/:account", async function (req, res, next) {
  try {
    console.log(req.params);
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
