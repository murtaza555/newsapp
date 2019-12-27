import template from '../../templates/mainadmin.hbs';

import mustache from 'mustache';
import tag from 'html-tag-js';
import Page from '../../components/page';
import ajax from '../../libs/ajax'


let totalvisitcount1;
let namelist = [];
let rough = {
    data: null
}


export default function mainadmin() {







    let totalvisitcount1 = 0;


    const page = Page('Murtaza');



    let values_user = {
        user_id123: null,
        name123: null,
        email123: null,
        password123: null,
    }

    let monthvisit_object = {
        monthvisit123: null

    }
    page.addEventListener('input', function(e) {
        let delete1234 = e.target.id;
        let value_from_user = e.target.value;



        if (delete1234 === "user_id") {
            values_user.user_id123 = value_from_user;
        }

        if (delete1234 === "name") {
            values_user.name123 = value_from_user;

        }
        if (delete1234 === "email") {
            values_user.email123 = value_from_user;

        }
        if (delete1234 === "password") {
            values_user.password123 = value_from_user;

        }

        if (delete1234 === "monthvisit") {
            monthvisit_object.monthvisit123 = value_from_user;

        }



    })

    page.addEventListener('click', function(e) {

        let delete123 = e.target.id;
        let delete1 = e.target;


        if (delete1 instanceof HTMLButtonElement) {

            ajax({
                    url: '/murtaza_admin_list_delete',
                    method: 'post',
                    contentType: 'application/json',
                    data: {
                        delete: delete123
                    }
                })
                .then(res => {
                    if (res.status === 'ok') {
                        console.log("deletion done from client")

                    }

                    if (res.status === 'no_admin') {
                        console.log("admin cant be deleted")

                    }

                    if (res.status === 'no') {
                        console.log("user deletion not done ")



                    }
                })
                .catch(err => {
                    console.log(err);
                });

        }


        if (delete1 instanceof HTMLInputElement) {


            if (delete123 === "add_user_submit") {
                ajax({
                        url: '/murtaza_admin_list_add',
                        method: 'post',
                        contentType: 'application/json',
                        data: values_user
                    })
                    .then(res => {
                        if (res.status === 'ok') {
                            console.log("Additon done from client")
                            let p1 = tag('p', {
                                textContent: "user Added Successfully",
                                style: {
                                    color: 'green'
                                }
                            })


                            page.append(p1);
                            page.show();

                        }



                        if (res.status === 'no') {
                            console.log("user addition not done ")
                            let p2 = tag('p', {
                                textContent: "user Addedtion not done ",
                                style: {
                                    color: 'red'
                                }
                            })


                            page.append(p1);
                            page.show();



                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });


            }
            if (delete123 === "monthvisit_submit") {


                ajax({
                        url: '/murtaza_monthvisit_get',
                        method: 'post',
                        contentType: 'application/json',
                        data: monthvisit_object
                    })
                    .then(res => {
                        if (res.status === 'ok') {

                            showdateresult(res.visitnumber1);


                        }



                        if (res.status === 'no') {
                            console.log("date caught not done ")



                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });


            }


        }



    })


    ajax({
            url: '/murtaza_admin_list',
            method: 'post',
            contentType: 'application/json',
        })
        .then(res => {
            if (res.status === 'ok') {

                totalvisitcount1 = res.totalvisitcount;
                namelist = res.namelist;

                takevisitvalue(totalvisitcount1, namelist);

            }

            if (res.status === 'no') {
                console.log("listing not done")



            }
        })
        .catch(err => {
            console.log(err);
        });
    var mainadmin
    let takevisitvalue = function(value, namelist) {


        let adminList = namelist;


        totalvisitcount1 = value;
        mainadmin = tag.parse(mustache.render(template, {
            adminList: adminList,

            visitcount: [{
                totalvisitcount1: totalvisitcount1

            }]



        }));



        page.append(mainadmin);
        page.show();

    }
    let mainadmin1;
    let showdateresult = function(dateresult) {


        let p = tag('p', {
            textContent: "Result =   " + dateresult
        })


        page.append(p);
        page.show();

    }


}