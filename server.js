var quit = false;

const mysql = require('mysql');
const inquirer = require('inquirer');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tracker_DB"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

function userChoice() {
  inquirer
    .prompt(
      {
        type: "list",
        name: "actionChoice",
        message: "What do you want to do?",
        choices: [
          'add',
          'view',
          'update employee role',
          'delete',
          'quit'
        ]
      }
    )
    .then(answer => {
      const { actionChoice } = answer;
      if (actionChoice === "add") {
        addChoice();
      } else if (actionChoice === "view") {
        viewChoice();
      } else if (actionChoice === "update employee role") {
        updateChoice();
      }else if (actionChoice === "delete") {
        deleteChoice();
      } else {
        quitChoice();
      }
    });
}

function addChoice() {
  inquirer
    .prompt(
      {
        type: "list",
        name: "tableChoice",
        message: "What table do yo want to add to?",
        choices: [
          'department',
          'role',
          'employee'
        ]
      }
    )
    .then(answer => {
      const { tableChoice } = answer;
      var tableQuestions = [];

      async function nexQuestions() {
        if (tableChoice === "department") {
          tableQuestions = [
            {
              type: "input",
              name: "name",
              message: "Department name:"
            }
          ];
        } else if (tableChoice === "role") {
          tableQuestions = [
            {
              type: "input",
              name: "title",
              message: "Role title:"
            },
            {
              type: "input",
              name: "salary",
              message: "Salary:"
            },
            {
              type: "input",
              name: "department_id",
              message: "Department ID:"
            }
          ];
        } else if (tableChoice === "employee") {
          tableQuestions = [
            {
              type: "input",
              name: "first_name",
              message: "Employee's first name:"
            },
            {
              type: "input",
              name: "last_name",
              message: "Employee's last name:"
            },
            {
              type: "input",
              name: "role_id",
              message: "Role ID:"
            },
            {
              type: "input",
              name: "manager_id",
              message: "Manager ID:"
            }
          ];
        }
      }

      nexQuestions()
      .then(
        inquirer
          .prompt(tableQuestions)
          .then(answer => {     
            var sql = "";

            if (tableQuestions[0].name === "name") {
              sql = "INSERT INTO department (name) VALUES ('" + answer.name + "')";

            } else if (tableQuestions[0].name === "title") {
              sql = "INSERT INTO role (title, salary, department_id) VALUES ('" + answer.title + "', '" + answer.salary + "', '" + answer.department_id + "')";

            } else {
              sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('" + answer.first_name + "', '" + answer.last_name + "', '" + answer.role_id + "', '" + answer.manager_id + "')";
            }

            console.log("prepared to insert: " + sql)
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("Inserted: " + sql);
              sql = "";
              userChoice();
            });

          })
      );
    });
}



function viewChoice() {

  inquirer
    .prompt(
      {
        type: "list",
        name: "tableChoice",
        message: "What table do yo want to view?",
        choices: [
          'department',
          'role',
          'employee'
        ]
      }
    )
    .then(answer => {
      sql = "SELECT * FROM " + answer.tableChoice;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        sql = "";
        userChoice();
      });
    })
}

function updateChoice() {

  var updateQuestion = [
    {
      type: "list",
      name: "tableChoice",
      message: "What employee do yo want update?",
      choices: []
    }
  ];

  con.query("SELECT * FROM employee", function (err, result, fields) {
    if (err) throw err;

    for (var i = 0; i <= (result.length - 1); i++) {
      var full_name = result[i].first_name + " " + result[i].last_name;
      updateQuestion[0].choices.push(full_name);
      if (i === (result.length - 1)) {
        askUpdate();
      }
    }
  });

  function askUpdate() {
    inquirer
      .prompt(updateQuestion)
      .then(answer => {
        console.log("answer: " + answer.tableChoice);
        deleteEmployee(answer.tableChoice);
        updateEmployee();
      });
  }

  function deleteEmployee(employee) {
    var employeeName = employee.split(" ");

    var sql = "DELETE FROM employee WHERE first_name = '" + employeeName[0] + "' AND last_name = '" + employeeName[1] + "'";
    console.log(sql);
    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  }

  function updateEmployee() {
    employeeQuestions = [
      {
        type: "input",
        name: "first_name",
        message: "Employee's first name:"
      },
      {
        type: "input",
        name: "last_name",
        message: "Employee's last name:"
      },
      {
        type: "input",
        name: "role_id",
        message: "Role ID:"
      },
      {
        type: "input",
        name: "manager_id",
        message: "Manager ID:"
      }
    ];

    inquirer
      .prompt(employeeQuestions)
      .then(answer => {
        sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('" + answer.first_name + "', '" + answer.last_name + "', '" + answer.role_id + "', '" + answer.manager_id + "')";
        console.log("prepared to insert: " + sql)
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("Inserted: " + sql);
              sql = "";
              userChoice();
            });
      });

  }

}

function quitChoice() {
  con.end
  return;
}

userChoice();