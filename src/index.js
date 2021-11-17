const { response, request } = require('express')
const express = require('express')
const {v4: uuidv4} = require("uuid")
const app = express()

//middleware JSON
app.use(express.json())

//middleware
function verifyExistAccountCPF(request,response,next){
    const {cpf} = request.headers
    const customer = customers.find(customer => customer.cpf === cpf)
    if(!customer){
        return response.status(404).json({error: "Customer not found"})
    }

    request.customer = customer;

    return next()
}



//array customers accont
const customers = []

//creat account
app.post ("/account", (request, response) => {
    const {cpf, name} = request.body
    const customersAlreadyExists = customers.some(
        (customers) => customers.cpf === cpf
    )

    if(customersAlreadyExists){
        return response.status(400).json({error: "Customer already EXIST!"})
    }    

    const customer = {
        cpf,
        name,
        id:uuidv4(),
        statement: []
    } 
    customers.push(customer)

    return response.status(201).json(customer)

})


// app.use(verifyExistAccountCPF)

//find statement
app.get ("/statement", verifyExistAccountCPF, (request,response) => {
    const {customer} = request
    return response.json(customer.statement)
})

app.post("/deposit", verifyExistAccountCPF, (request,response)=>{
    const {description, amount} = request.body;

    const {customer} = request;

    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation)

    return response.status(201).send()

})

//server starter
app.listen(3333, () => {
    console.log("🙈 Servidor reiniciado 🙉")
} )