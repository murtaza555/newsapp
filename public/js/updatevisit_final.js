// function updatevisit_final(con) {


//     let query1 = `select visitcount from assects `;
//     con.query(query1, (err, result) => {
//         let check1 = result.filter(function(element) {
//             var initalcount = element.visitcount;
//             var finalcount = element.visitcount + 1;

//             var query2 = 'update assects set visitcount=? where  visitcount=?';
//             con.query(query2, [finalcount, initalcount], (err, result) => {

//                 console.log("upgrade     done from updatevisit.js");
//             });

//         })

//     });


// }

//import ajax from '/ajax';
import ajax from 'ajax-request';
console.log("document loaded");


$(document).ready(function() {
    console.log("document loaded");

    console.log("hello updatevisit_final.js");
    ajax({
            url: 'ajax/',
            method: 'post',
            contentType: 'application/json',
            data: {
                say: 'updatevisit',

            }
        })
        .then(res => {
            console.log(res);
            if (res.status === 'ok') {
                // location.href = '/dashstudent';
                // localStorage.setItem("session_student", res.emailLocal);
                this.console.log("update done")

            }

            if (res.status === 'no') {
                this.console.log("update not done")

                // let p_error = document.createElement('p').textContent = "User Not Found..!"
                // document.querySelector('#comment_login').append(p_error);

            }
        })
        .catch(err => {
            console.log(err);
        });


});