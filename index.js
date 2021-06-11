'use strict';

//Dependencies needed
const mysql = require("mysql");
const inquirer = require("inquirer");

require("console.table");

// list of needed message prompts
const message_prompts = {
    all_employees: "View All Employees",
    by_department: "View All Employees By Department",
    by_manager: "View All Employees By Manager",
    add_employee: "Add An Employee",
    remove_employee: "Remove An Employee",
    update_role: "Update Employee Role",
    update_em_manager: "Update Employee Manager",
    all_roles: "View All Roles",
    exit: "Exit"
}

// create the port and add password and stuff like that
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Cl0akedSchemer',
    database: 'employees'
});

connection.connect(err => {
    if (err) throw err;
    prompt();
});

// The functions section --------------------------
function prompt(){

    inquirer.prompt({
        name: "action",
        type: "type",
        message: "What would you like to do?",
        choices: [
            message_prompts.all_employees,
            message_prompts.by_department,
            message_prompts.by_manager,
            message_prompts.add_employee,
            message_prompts.remove_employee,
            message_prompts.update_role,
            message_prompts.exit
        ]
    })
    .then(answer => {
        console.log("answer", answer);

        switch(answer.action) {
            case message_prompts.all_employees:
                view_all_employees();
                break;

            case message_prompts.by_department:
                view_by_department();
                break;
            
            case message_prompts.by_manager:
                view_by_manager();
                break;

            case message_prompts.add_employee:
                
                break;
            
            case message_prompts.remove_employee:

                break;
        }
    });
}

// functions for all the difference cases needed----------------

function view_all_employees(){
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW ALL EMPLOYEES');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

function view_by_department(){

}

function view_by_manager(){

}


function ask_name(){
    return ([
        {
            name: "first",
            type: "input",
            message: "Enter the first name: "
        },

        {
            name: "last",
            type: "input",
            message: "Enter the last name: "
        }
    ]);
}