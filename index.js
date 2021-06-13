'use strict';

//Dependencies needed
const mysql = require("mysql2");
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
            message_prompts.all_employees,
            message_prompts.by_department,
            message_prompts.by_manager,
            message_prompts.add_employee,
            message_prompts.remove_employee,
            message_prompts.update_role,
            message_prompts.all_roles,
            message_prompts.exit
        ]
    })
        .then(answer => {
            console.log("answer", answer);

            switch (answer.action) {
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
                    add_employee();
                    break;

                case message_prompts.remove_employee:
                    remove_employee();
                    break;

                case message_prompts.update_role:
                    update_role();
                    break;

                case message_prompts.all_roles:
                    view_all_roles();
                    break;

                case message_prompts.exit:
                    connection.end();
                    break;
                
                default:

                    break;
            }
        });
}

// functions for all the difference cases needed----------------

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

function view_all_roles() {
    const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.name AS department
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


// funaction for adding employees
async function add_employee() {
    const add_name = await inquirer.prompt(ask_name());

    connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {

        if (err) throw err;
        const { role } = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: () => res.map(res => res.title),
                message: 'What is the employee role?: '
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
                manager_id = null;
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
            message: "Enter the last name: "
        }
    ]);
}

function ask_id() {
    return ([
        {
            name: "name",
            type: "input",
            message: "What is the employee ID?:  "
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