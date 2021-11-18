const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();

//middleware JSON
app.use(express.json());

//middleware
function verifyExistAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return response.status(404).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

//functions
function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

//array customers accont
const customers = [];

//creat account
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  const customersAlreadyExists = customers.some(
    (customers) => customers.cpf === cpf
  );

  if (customersAlreadyExists) {
    return response.status(400).json({ error: "Customer already EXIST!" });
  }

  const customer = {
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  };
  customers.push(customer);

  return response.status(201).json(customer);
});

// app.use(verifyExistAccountCPF)

//find statement
app.get("/statement", verifyExistAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/deposit", verifyExistAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw", verifyExistAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "insufficient founds" });
  }

  const statementOperation = {
    amount,
    createdAt: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/statement/date", verifyExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00"); //find all hours in the day

  const statement = customer.statement.filter(
    (statement) =>
      statement.createdAt.toDateString() === new Date(dateFormat).toDateString
  );

  return response.json(statement);
});

app.put("/accont", verifyExistAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;
  customer.name = name;

  return response.status(201).send();
});

app.delete("/account", verifyExistAccountCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);
  return response.status(200).json(customers);
});

//server starter
app.listen(3333, () => {
  console.log("🙈~uga Servidor reiniciado  uga~🙉");
});
