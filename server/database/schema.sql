set default_storage_engine=InnoDB;

create table categories(
    category varchar(50) primary key
);

create table posts(
    post_id varchar(50) primary key,
    category varchar(50) not null,
    title varchar(160) not null unique,
    body text not null,
    images text not null,
    views int unsigned default 0,
    likes int unsigned default 0,
    created_at timestamp default current_timestamp,
    foreign key (category) references categories(category) on update cascade on delete cascade
);

create table users(
    user_id varchar(50) primary key,
    name varchar(100),
    email varchar(100) unique not null,
    password text not null
);

create table logins(
    login_id int primary key auto_increment,
    user_id varchar(256) not null,
    token text not null,
    device varchar(100),
    expire varchar(20) not null,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(user_id) on update cascade on delete cascade
);