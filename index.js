'use strict';

//Dependencies needed
const mysql = require("mysql2");
const inquirer = require("inquirer");

require("console.table");

// list of needed message prompts
const message_prompts = {
    view_employees: "View All Employees",
    by_department: "View All Employees By Department",
    by_manager: "View All Employees By Manager",
    view_departments: "View All Departments",
    add_department: "Add A Department",
    add_role: "Add A Role",
    add_employee: "Add An Employee",
    remove_employee: "Remove An Employee",
    remove_role: "Remove A Role",
    remove_department: "Remove A Department",
    update_role: "Update Employee Role",
    update_em_manager: "Update Employee Manager",
    view_roles: "View All Roles",
    exit: "Exit"
}

// create the port and add password and stuff like that
const connection = mysql.createConnection({
    host: 'localhost',
    //port: 3306,
    user: 'root',
    password: 'Cl0akedSchemer',
    database: 'employees'
});

connection.connect(err => {
    if (err) throw err;
    prompt();
});

// The functions section --------------------------
function prompt() {

    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            message_prompts.view_departments,
            message_prompts.view_roles,
            message_prompts.view_employees,
            message_prompts.add_department,
            message_prompts.add_role,
            message_prompts.add_employee,
            message_prompts.update_role,
            
            message_prompts.remove_employee,
            message_prompts.remove_role,
            message_prompts.remove_department,

            message_prompts.by_manager,
            message_prompts.by_department,

            message_prompts.exit
        ]
    })
        .then(answer => {
            console.log("answer", answer);

            switch (answer.action) {

                case message_prompts.view_departments: //view all departments
                    view_departments();
                    break;

                case message_prompts.view_roles:  //view all roles
                    view_roles();
                    break;

                case message_prompts.view_employees: //view all employees
                    view_all_employees();
                    break;

                case message_prompts.add_department: ///Add a new department
                    add_department();
                    break;

                case message_prompts.add_role: //Add a new role
                    add_role();
                    break;

                case message_prompts.add_employee: //Add a new employee
                    add_employee();
                    break;

                case message_prompts.update_role: //update an employee role
                    update_role();
                    break;

                case message_prompts.remove_employee:  //remove an employee
                    remove_employee();
                    break;

                case message_prompts.remove_role: // remove department
                    remove_role();
                    break;

                case message_prompts.remove_department: //remove department
                    remove_department();
                    break;

                case message_prompts.by_department: //view all employees by department
                    view_by_department();
                    break;

                case message_prompts.by_manager: //view all employees by manager
                    view_by_manager();
                    break;

                case message_prompts.all_roles: //view all employees by role
                    view_all_roles();
                    break;

                case message_prompts.exit: //exit the program
                    connection.end();
                    break;

                default:
                    break;
            }
        });
}

// -------------------functions for all the difference cases needed----------------

// view all the employees
function view_all_employees() {
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

// ------------ ALL FUNCTIONS FOR DEPARTMENT-BASED OUTPUT-----------------------

// view all employees by department
function view_by_department() {
    const query = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY department.name;`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY DEPARTMENT');
        console.log('\n');
        console.table(res);
        prompt();
    });

}

// view all the departments
function view_departments() {
    var query = `SELECT * FROM department
    ORDER BY department.id;`;

    connection.query(query, function (err, res) {
        console.log("\n");
        console.log("VIEW ALL DEPARTMENTS");
        console.log("\n");
        console.table(res);
        prompt();
    });
}

// for adding a department
async function add_department() {

    inquirer.prompt({
        name: "department",
        type: "input",
        message: "Enter the new department name: ",
    })
        .then(function (answer) {
            var query = "INSERT INTO department (name) VALUES ( ? )";
            connection.query(query, answer.department, function (err, res) {
                console.log("\n");
                console.log(`You have added this department: ${(answer.department)}`)
            })
            view_departments();
        });
}

// remove department from system
async function remove_department() {
    const answer = await inquirer.prompt([
        {
            name: "department_id",
            type: "input",
            message: "Enter the department ID you want to remove: "
        }
    ]);

    connection.query("DELETE FROM department WHERE ? ",
        { id: answer.department_id },
        function (err) {
            if (err) {
                throw err;
            }
        }
    )
    console.log("Department has been removed from the system. \n");
    prompt();
}




// ------------ FUNCTIONS FOR MANAGER BASED OUTPUT ----------------

// view all employees by managers
function view_by_manager() {
    const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name, role.title
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY manager;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY MANAGER');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

// ------------- FUNCTIONS BASED ON NEEDING ROLE OUTPUT ---------------

// view all the employees by roles
function view_all_roles() {
    const query = `SELECT role.title, role.id, department.name AS department, role.salary
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY role.title;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW EMPLOYEE BY ROLE');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

//view all roles
function view_roles() {
    var query = "SELECT * FROM role";

    connection.query(query, function (err, res) {
        console.log("\n");
        console.log("VIEW ALL ROLES");
        console.log("\n");
        console.table(res);
        prompt();
    });
}

// Add a role to the system
async function add_role() {
    const add_role = await inquirer.prompt(ask_role());
    const add_salary = await inquirer.prompt(ask_salary());

    connection.query('SELECT * FROM department;', async (err, res) => {
        if (err) throw err;
        console.log("work");

        const { department } = await inquirer.prompt([
            {
                name: "department",
                type: "list",
                choices: () => res.map(res => res.id),
                message: "Choose a department ID for the role to have:"
            }
        ]);

        connection.query(
            'INSERT INTO role SET ?',
            {
                title: add_role.role,
                salary: add_salary.salary,
                department_id: parseInt(department)
            },
            (err, res) => {
                if (err) throw err;
                view_roles();
            }
        );
    });
}

// remove role from system
async function remove_role() {
    const answer = await inquirer.prompt([
        {
            name: "role_id",
            type: "input",
            message: "Enter the role ID you want to remove: "
        }
    ]);

    connection.query("DELETE FROM role WHERE ? ",
        { id: answer.role_id },
        function (err) {
            if (err) {
                throw err;
            }
        }
    )
    console.log("Role has been removed from the system. \n");
    prompt();
}

//------------------ Applying to all the employees
// --------------------function for adding employees
async function add_employee() {
    const add_name = await inquirer.prompt(ask_name());

    connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {

        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: () => res.map(res => res.title),
                message: 'What role does the employee have? '
            }
        ]);
        let role_id;
        for (const row of res) {
            if (row.title === role) {
                role_id = row.id;
                continue;
            }
        }
        connection.query('SELECT * FROM employee', async (err, res) => {
            if (err) throw err;
            let choices = res.map(res => `${res.first_name} ${res.last_name}`);
            choices.push('none');
            let { manager } = await inquirer.prompt([
                {
                    name: 'manager',
                    type: 'list',
                    choices: choices,
                    message: 'Choose the employee Manager: '
                }
            ]);
            let manager_id;
            let manager_name;
            if (manager === 'none') {
                manager_id = NULL;
            } else {
                for (const data of res) {
                    data.fullName = `${data.first_name} ${data.last_name}`;
                    if (data.fullName === manager) {
                        manager_id = data.id;
                        manager_name = data.fullName;
                        console.log(manager_id);
                        console.log(manager_name);
                        continue;
                    }
                }
            }
            console.log('Employee has been added. Please view all employee to verify...');
            connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: add_name.first,
                    last_name: add_name.last,
                    role_id: role_id,
                    manager_id: parseInt(manager_id)
                },
                (err, res) => {
                    if (err) throw err;
                    prompt();

                }
            );
        });
    });
}

// remove an employee
async function remove_employee() {
    const answer = await inquirer.prompt([
        {
            name: "ID",
            type: "input",
            message: "Enter the employee ID you want to remove: "
        }
    ]);

    connection.query("DELETE FROM employee WHERE ? ",
        { id: answer.ID },
        function (err) {
            if (err) {
                throw err;
            }
        }
    )
    console.log("Employee has been removed from the system.");
    prompt();
}

async function update_role() {
    const employee_id = await inquirer.prompt(ask_id());

    connection.query("SELECT role.id, role.title FROM role ORDER BY role.id;", async (err, res) => {
        if (err) { throw err; }
        const { role } = await inquirer.prompt([
            {
                name: "role",
                type: "list",
                choices: () => res.map(res => res.title),
                message: "What is the new employee's role? "
            }
        ]);

        let role_id;
        for (const row of res) {
            if (row.title === role) {
                role_id = row.id;
                continue;
            }
        }

        connection.query(`UPDATE employee
        SET role_id = ${role_id}
        WHERE employee.id = ${employee_id.name}`, async (err, res) => {
            if (err) { throw err; }
            console.log("Role has been updated... ");
            prompt();
        });
    });

}



// just function for asking name of employee for input reasons
function ask_name() {
    return ([
        {
            name: "first",
            type: "input",
            message: "Enter the first name: "
        },

        {
            name: "last",
            type: "input",
            message: "Enter the last name:"
        }
    ]);
}

function ask_id() {
    return ([
        {
            name: "name",
            type: "input",
            message: "What is the employee ID?"
        }
    ]);
}

function ask_role() {
    return ([
        {
            name: "role",
            type: "input",
            message: "Enter the new role:"
        }
    ]);
}

function ask_salary() {
    return ([
        {
            name: "salary",
            type: "input",
            message: "Enter the salary for this role:"
        }
    ]);
}


function remove(input) {
    const promptQ = {
        yes: "Yes",
        no: "No I don't (view all employees on the main option)"
    };

    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "In order to proceed, an ID must be entered. Do you know the employee's ID?",
            choices: [promptQ.yes, promptQ.no]
        }
    ])
        .then(answer => {
            if (input === 'delete' && answer.action === "yes") remove_employee();
            else if (input === 'role' && answer.action === "yes") update_role();
            else view_all_employees();
        });
};