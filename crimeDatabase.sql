-- drop database CS485Final;
create database CS485Final;
use CS485Final;

create table regions (
    region_id int auto_increment  primary key,
    region_name varchar(255) not null unique
);

create table countries (
    country_id int auto_increment primary key,
    iso_alpha2 varchar(255) not null unique,
    iso_alpha3 varchar(255) not null unique,
    country_name varchar(255) not null,
    region_id int null,
    continent varchar(255) null,
    foreign key (region_id) references regions(region_id)
);

create table data_sources (
    source_id int auto_increment primary key,
    source_name varchar(255) not null,
    publisher varchar(255) not null,
    url varchar(255),
    license varchar(255),
    last_updated date
);

create table ocindex_country_year (
    id int auto_increment  primary key,
    country_id int not null,
    year int not null,
    criminality_avg decimal(4,2),
    criminal_markets_avg decimal(4,2),
    criminal_actors_avg decimal(4,2),
    resilience_avg decimal(4,2),
    unique key uq_country_year (country_id, year),
    foreign key (country_id) references countries(country_id)
);

create table ocindex_market_lookup (
    market_id int auto_increment primary key,
    market_name varchar(100) not null unique
);

create table ocindex_market_scores (
    id int auto_increment primary key,
    country_year_id int not null,
    market_id int not null,
    score decimal(4,2),
    unique key uq_cy_market (country_year_id, market_id),
    foreign key (country_year_id) references ocindex_country_year(id),
    foreign key (market_id) references ocindex_market_lookup(market_id)
);

create table ocindex_actor_lookup (
    actor_type_id int auto_increment primary key,
    actor_type_name varchar(255) not null unique
);

create table ocindex_actor_scores (
    id int auto_increment primary key,
    country_year_id int not null,
    actor_type_id int not null,
    score decimal(4,2),
    unique key uq_cy_actor (country_year_id, actor_type_id),
    foreign key (country_year_id) references ocindex_country_year(id),
    foreign key (actor_type_id) references ocindex_actor_lookup(actor_type_id)
);

create table ocindex_resilience_lookup (
    indicator_id int auto_increment  primary key,
    indicator_name varchar(255) not null unique
) engine=innodb;

create table ocindex_resilience_scores (
    id int auto_increment primary key,
    country_year_id int not null,
    indicator_id int not null,
    score decimal(4,2),
    unique key uq_cy_indicator (country_year_id, indicator_id),
    foreign key (country_year_id) references ocindex_country_year(id),
    foreign key (indicator_id) references ocindex_resilience_lookup(indicator_id)
);

create table ctdc_victims (
    victim_id int auto_increment primary key,
    year_of_registration int,
    datasource varchar(255),
    gender varchar(255),
    age_broad varchar(255),
    majority_status varchar(255),
    citizenship_id int ,   
    exploitation_country_id int ,
    foreign key (citizenship_id) references countries(country_id),
    foreign key (exploitation_country_id) references countries(country_id)
);

create table ctdc_exploitation_types (
    exploit_type_id int auto_increment  primary key,
    exploit_type_name varchar(255) not null unique
);

create table ctdc_victim_exploitation (
    victim_id int not null,
    exploit_type_id int not null,
	primary key (victim_id, exploit_type_id),
    foreign key (victim_id) references ctdc_victims(victim_id),
    foreign key (exploit_type_id) references ctdc_exploitation_types(exploit_type_id)
);

create table ctdc_means_of_control (
    moc_id int auto_increment primary key,
    moc_name varchar(255) not null unique
);

create table ctdc_victim_means_of_control (
    victim_id int not nulL,
    moc_id int not nulL,
	primary key (victim_id, moc_id),
    foreign key (victim_id) references ctdc_victims(victim_id),
    foreign key (moc_id) references ctdc_means_of_control(moc_id)
);

create table ctdc_labour_types (
    labour_type_id int auto_increment primary key,
    labour_type_name varchar(255) not nulL unique
);

create tabLe ctdc_victim_labour_types (
    victim_id int not nulL,
    labour_type_id int not nulL,
	primary key (victim_id, labour_type_id),
    foreign key (victim_id) references ctdc_victims(victim_id),
    foreign key (labour_type_id) references ctdc_labour_types(labour_type_id)
);