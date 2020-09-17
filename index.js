const mysql = require("mysql");
const inquirer = require("inquirer");
const { allowedNodeEnvironmentFlags } = require("process");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3030,
  user: "root",
  password: "password",
  database: "employee_db",
});

connection.connect(function (err) {
    if (err) throw err;
    start();
  });

  function start(){
      inquirer
        .prompt({
            name: "userInput",
            type:"list",
            message: "Please, choose an option.",
            choices: ["View Departments", "View Roles", "View Employees", "Add Departments",
                "View Roles", "View Employees", "Add Departments", "Add Roles", "Add Employee",
                "Update Employee Role", "Delete Departments", "Delete Role", "Delete Employee",
                 "Exit"],
        })
        .then(function (answer){
            if(answer.userInput === "View Departments"){
                viewDepartments();
            }else if(answer.userInput === "View Roles"){
                viewRoles();
            }else if(answer.userInput === "View Employees"){
                viewEmployees();
            }else if(answer.userInput === "Add Departments"){
                addDepartment();
            }else if(answer.userInput === "View Roles"){
                viewRoles();
            }else if(answer.userInput === "View Employees"){
                viewEmployees();
            }else if(answer.userInput === "Add Departments"){
                addDepartments();
            }else if(answer.userInput === "Add Roles"){
                addRole();
            }else if(answer.userInput === "Add Employee"){
                addEmployee();
            }else if(answer.userInput === "Update Employee Role"){
                updateEmpRole();
            }else if(answer.userInput === "Delete Departments"){
                deleteDepartment();
            }else if(answer.userInput === "Delete Role"){
                deleteRole();
            }else if(answer.userInput === "Delete Employee"){
                deleteEmployee();
            }else{
                connection.end();
            }
        });  
  }

  function menuOrExit(){
      inquirer
        .prompt({
            name: "userInput",
            type: "list",
            message: "What would you like to do?",
            choices: ["Return to Menu", "Exit"]
        })
        .then(function (answer){
            if(answer.userInput === "Return to Menu"){
                start();
            }else{
                connection.end();
            }
        });
  }

  function viewDepartments(){
      connection.query("SELECT * From department", function(err, results){
          if(err) throw err;
          console.table(results);
          menuOrExit();
      });
  }

  function viewRoles(){
      connection.query(
          `select title, salary, name from role
          inner join department on role.department_id=department.id`,
          function(err, results){
              if(err) throw err;
              menuOrExit();
          }
      );
  }

  function viewEmployees(){
      connection.query(
          `select first_name, last_name, title, salary, name from employee
          inner join role on employee.role_id=role.id
          inner join department on role.department_id=department.id`,
          function(err, results){
              if(err) throw err;
              console.table(results);
              menuOrExit();
          }
      );
  }

  function printResults(err, result){
      if(err) throw err;
      console.log(result.affectedRows + " deleted.");
      menuOrExit();
    }

  function deleteDepartment(){
      connection.query("SELECT * FROM department", function(err, results){
        inquirer.prompt([
            {
                name: "name",
                type: "list",
                message: "Which department do you want to delete?",
                choices: function(){
                    var choiceArray = ["Go Back"];
                    for(var i=0; i < results.lenth; i++){
                        choiceArray.push(ressults[i].name);
                    }
                    return choiceArray;
                }
            }      
      ]).then(function(answer){
          if(answer.name === "Go Back"){
              start();
          }else{
              connection.query(`DELETE FROM department WHERE name = "${answer.name}"`, printResults);
          }
      })
    })
  };

  function deleteRole(){
      connection.query("SELECT * FROM role", function(err, results){
          inquirer.prompt([
                {
                  name: "name",
                  type: "list",
                  message: "Which role do you want to delete?",
                  choices: function(){
                      var choiceArray = ["Go Back"];
                      for (var i=0; i < results.length; i++){
                          choiceArray.push(results[i].title);
                      }
                      return choiceArray
                    }
                }
            ]).then(function(answer){
              if(answer.name ==="Go Back"){
              start();
            }else{
                connection.query(`DELETE FROM role WHERE title = "${answer.name}"`, printResults);
            }
        })
    })
};

function deleteEmployee(){
    connection.query("SELECT * FROM employee", function(err, results){
        inquirer.prompt([
                {
                name: "name",
                type: "list",
                message: "Which employee do you want to delete?",
                choices: function(){
                    var choiceArray = ["Go Back"];
                    for (var i=0; i < results.length; i++){
                        choiceArray.push(results[i].last_name);
                    }
                    return choiceArray
                }
            }
            ]).then(function(answer){
                if(answer.name ==="Go Back"){
                start();
            }else{
                connection.query(`DELETE FROM employee WHERE last_name = "${answer.name}"`, printResults);
            }
        })
    })
};

async function addDepartment(){
    const department = await inquirer.prompt([
        {
            name: "name",
            message: "What is the department name?",            
        }
    ])
    connection.query(`insert into department (name) values ("${department.name}")`, printResults)
}

function addRole(){
    connection.query("SELECT * FROM department", async function(err, results){
        const departments = results.map((result) => ({
            name: result.name,
            value: result.id
        }))
        const roleInfo = await inquirer.prompt([
            {
                name: "title",
                message: "What is the position title?"
            },
            {
                name: "salary",
                message: "What is the position salary?"
            },
            {
                type: "list",
                name: "department_id",
                message: "Which department is this role for?",
                choices: departments
            }
        ])
        connection.query(`insert into role(title, salary, department_id) values("${roleInfo.title}", "${roleInfo.salary}", "${roleInfo.department_id}")`, printResults)
    })
}

function addEmployee(){
    connection.query("SELECT * FROM role", async function(err, results){
        connection.query("SELECT *FROM role", async function(err, results){
            const roles = results.map((result) => ({
                name: result.title,
                value: result.id
            }))
            const employeeInfo = await inquirer.prompt([
                {
                    name: "first_name",
                    message: "What is the employee's first name?"
                },
                {
                    name: "last_name",
                    message: "What is the employee's last name?"
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "What is the employee's role?",
                    choices: roles
                }
            ])
            connection.query(`insert into employee(first_name, last_name, role_id) values("${employeeInfo.first_name}", "${employeeInfo.last_name}", "${employeeInfo.role_id}")`, printResults)
        })
    })
}

function updateEmpRole(){
    connection.query("SELECT * FROM employee", function (err, employees) {
        connection.query ("SELECT * FROM role", async function(err, roles) {
            const roleChoices = roles.map ((role) => ({
                name: role.title, 
                value: role.id
            }))
            const employeeChoices = employees.map ((employee) => ({
                name: employee.first_name + " " + employee.last_name, 
                value: employee.id
            }))
            const updateEmployee = await inquirer.prompt([
                {
                    type: "list",
                    name: "employee_id",
                    message: "Please choose an employee to edit.",
                    choices: employeeChoices 
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "Please choose a new role.",
                    choices: roleChoices 
                }
            ])
            connection.query (`update employee set role_id = ${updateEmployee.role_id} where id=${updateEmployee.employee_id}`, printResults)
        })
    })
}