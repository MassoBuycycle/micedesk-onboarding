create table rocket_production.onboarding_equipment_types
(
    id             int auto_increment
        primary key,
    equipment_name varchar(100)                        not null,
    description    text                                null,
    created_at     timestamp default CURRENT_TIMESTAMP null,
    updated_at     timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table rocket_production.onboarding_file_types
(
    id                 int auto_increment
        primary key,
    name               varchar(255)                        not null,
    code               varchar(50)                         not null,
    category           varchar(50)                         not null,
    allowed_extensions json                                not null,
    max_size           int                                 not null,
    created_at         timestamp default CURRENT_TIMESTAMP null,
    updated_at         timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint unique_code_category
        unique (code, category)
);

create table rocket_production.onboarding_files
(
    id            int auto_increment
        primary key,
    original_name varchar(255)                         not null,
    storage_path  varchar(1024)                        not null,
    file_type_id  int                                  null,
    entity_type   varchar(50)                          not null,
    entity_id     int                                  not null,
    size          int                                  not null,
    mime_type     varchar(255)                         not null,
    is_temporary  tinyint(1) default 0                 null,
    created_at    timestamp  default CURRENT_TIMESTAMP null,
    updated_at    timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table rocket_production.onboarding_hotels
(
    id                            int auto_increment
        primary key,
    system_hotel_id               varchar(50)                              null comment 'External hotel ID',
    name                          varchar(255)                             not null,
    street                        varchar(255)                             null,
    postal_code                   varchar(20)                              null,
    city                          varchar(100)                             null,
    country                       varchar(100)                             null,
    phone                         varchar(50)                              null,
    email                         varchar(255)                             null,
    website                       varchar(255)                             null,
    billing_address_name          varchar(255)                             null,
    billing_address_street        varchar(255)                             null,
    billing_address_zip           varchar(20)                              null,
    billing_address_city          varchar(100)                             null,
    billing_address_vat           varchar(50)                              null,
    star_rating                   int            default 0                 null,
    category                      varchar(100)                             null,
    opening_date                  int                                      null,
    latest_renovation_date        int                                      null,
    total_rooms                   int            default 0                 null,
    conference_rooms              int            default 0                 null,
    pms_system                    text                                     null,
    no_of_parking_spaces          int            default 0                 null,
    no_of_parking_spaces_garage   int            default 0                 null,
    no_of_parking_spaces_electric int            default 0                 null,
    no_of_parking_spaces_bus      int            default 0                 null,
    no_of_parking_spaces_outside  int            default 0                 null,
    no_of_parking_spaces_disabled int            default 0                 null,
    parking_cost_per_hour         decimal(10, 2) default 0.00              null,
    parking_cost_per_day          decimal(10, 2) default 0.00              null,
    parking_remarks               text                                      null,
    distance_to_airport_km        int            default 0                 null,
    distance_to_highway_km        int            default 0                 null,
    distance_to_fair_km           int            default 0                 null,
    distance_to_train_station     int            default 0                 null,
    distance_to_public_transport  int            default 0                 null,
    opening_time_pool             varchar(100)                             null,
    opening_time_fitness_center   varchar(100)                             null,
    opening_time_spa_area         varchar(100)                             null,
    equipment_fitness_center      text                                     null,
    equipment_spa_area            text                                     null,
    planned_changes               text                                     null,
    attraction_in_the_area        text                                     null,
    created_at                    timestamp      default CURRENT_TIMESTAMP null,
    updated_at                    timestamp      default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    description                   text                                     null,
    opening_year                  int                                      null,
    latest_renovation_year        int                                      null,
    constraint hotel_id
        unique (system_hotel_id)
);

create table rocket_production.onboarding_events
(
    id               int auto_increment
        primary key,
    hotel_id         int                                 not null,
    contact_name     varchar(255)                        null,
    contact_phone    varchar(50)                         null,
    contact_email    varchar(255)                        null,
    contact_position varchar(100)                        null,
    created_at       timestamp default CURRENT_TIMESTAMP null,
    updated_at       timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_events_ibfk_1
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade
);

create table rocket_production.onboarding_event_av_equipment
(
    id             int auto_increment
        primary key,
    event_id       int                                      not null,
    equipment_name varchar(100)                             not null,
    quantity       int            default 0                 null,
    price_per_unit decimal(10, 2) default 0.00              null,
    created_at     timestamp      default CURRENT_TIMESTAMP null,
    updated_at     timestamp      default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_event_av_equipment_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create index event_id
    on rocket_production.onboarding_event_av_equipment (event_id);

create table rocket_production.onboarding_event_booking
(
    event_id                  int                                  not null
        primary key,
    has_options               tinyint(1) default 0                 null,
    allows_split_options      tinyint(1) default 0                 null,
    option_duration           varchar(100)                         null,
    allows_overbooking        tinyint(1) default 0                 null,
    rooms_only                tinyint(1) default 0                 null,
    last_minute_leadtime      varchar(100)                         null,
    contracted_companies      text                                 null,
    refused_requests          text                                 null,
    unwanted_marketing        text                                 null,
    requires_second_signature tinyint(1) default 0                 null,
    exclusive_clients         tinyint(1) default 0                 null,
    created_at                timestamp  default CURRENT_TIMESTAMP null,
    updated_at                timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_event_booking_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create table rocket_production.onboarding_event_equipment
(
    event_id       int           not null,
    equipment_type varchar(100)  not null,
    quantity       int default 0 null,
    primary key (event_id, equipment_type),
    constraint onboarding_event_equipment_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create table rocket_production.onboarding_event_financials
(
    event_id          int                                  not null
        primary key,
    requires_deposit  tinyint(1) default 0                 null,
    deposit_rules     text                                 null,
    deposit_invoicer  varchar(255)                         null,
    has_info_invoice  tinyint(1) default 0                 null,
    payment_methods   json                                 null,
    invoice_handling  text                                 null,
    commission_rules  text                                 null,
    has_minimum_spent tinyint(1) default 0                 null,
    created_at        timestamp  default CURRENT_TIMESTAMP null,
    updated_at        timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_event_financials_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create table rocket_production.onboarding_event_operations
(
    id                            int auto_increment
        primary key,
    event_id                      int                                      not null,
    sold_with_rooms_only          tinyint(1)     default 0                 null,
    last_minute_lead_time         varchar(100)                             null,
    sent_over_time_material       tinyint(1)     default 0                 null,
    lunch_location                text                                     null,
    min_participants_package      int            default 0                 null,
    coffee_break_location         text                                     null,
    advance_days_for_material     int            default 0                 null,
    room_drop_cost                decimal(10, 2) default 0.00              null,
    hotel_exclusive_clients       tinyint(1)     default 0                 null,
    exclusive_clients_info        text                                     null,
    deposit_needed_event          tinyint(1)     default 0                 null,
    deposit_rules_event           text                                     null,
    deposit_invoice_creator       varchar(255)                             null,
    informational_invoice_created tinyint(1)     default 0                 null,
    payment_methods_events        json                                     null,
    final_invoice_handling_event  text                                     null,
    contracted_companies          text                                     null,
    refused_requests              text                                     null,
    unwanted_marketing_tools      text                                     null,
    first_second_option           tinyint(1)     default 0                 null,
    split_options                 tinyint(1)     default 0                 null,
    option_hold_duration          varchar(100)                             null,
    overbooking_policy            tinyint(1)     default 0                 null,
    deposit_required              tinyint(1)     default 0                 null,
    accepted_payment_methods      json                                     null,
    commission_rules              text                                     null,
    second_signature_required     tinyint(1)     default 0                 null,
    has_overtime_material         tinyint(1)     default 0                 null,
    min_participants              int            default 0                 null,
    coffee_location               text                                     null,
    material_advance_days         int            default 0                 null,
    room_drop_fee                 decimal(10, 2) default 0.00              null,
    has_storage                   tinyint(1)     default 0                 null,
    has_minimum_spent             tinyint(1)     default 0                 null,
    minimum_spent_info            text                                     null,
    created_at                    timestamp      default CURRENT_TIMESTAMP null,
    updated_at                    timestamp      default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_event_operations_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create index event_id
    on rocket_production.onboarding_event_operations (event_id);

create table rocket_production.onboarding_event_spaces
(
    id                    int auto_increment
        primary key,
    event_id              int                                  not null,
    name                  varchar(255)                         not null,
    daily_rate            decimal(10, 2)                       null,
    half_day_rate         decimal(10, 2)                       null,
    size                  varchar(50)                          null,
    dimensions            varchar(50)                          null,
    cap_rounds            int                                  null,
    cap_theatre           int                                  null,
    cap_classroom         int                                  null,
    cap_u_shape           int                                  null,
    cap_boardroom         int                                  null,
    cap_cabaret           int                                  null,
    cap_cocktail          int                                  null,
    features              text                                 null,
    is_soundproof         tinyint(1) default 0                 null,
    has_daylight          tinyint(1) default 0                 null,
    has_blackout          tinyint(1) default 0                 null,
    has_climate_control   tinyint(1) default 0                 null,
    wifi_speed            varchar(100)                         null,
    beamer_lumens         varchar(100)                         null,
    supports_hybrid       tinyint(1) default 0                 null,
    presentation_software text                                 null,
    copy_fee              decimal(10, 2)                       null,
    has_tech_support      tinyint(1) default 0                 null,
    created_at            timestamp  default CURRENT_TIMESTAMP null,
    updated_at            timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_event_spaces_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create index event_id
    on rocket_production.onboarding_event_spaces (event_id);

create table rocket_production.onboarding_event_technical
(
    id                          int auto_increment
        primary key,
    event_id                    int                                      not null,
    beamer_lumens               varchar(100)                             null,
    copy_cost                   decimal(10, 2) default 0.00              null,
    software_presentation       text                                     null,
    wifi_data_rate              varchar(100)                             null,
    has_ac_or_ventilation       tinyint(1)     default 0                 null,
    has_blackout_curtains       tinyint(1)     default 0                 null,
    is_soundproof               tinyint(1)     default 0                 null,
    has_daylight                tinyint(1)     default 0                 null,
    is_hybrid_meeting_possible  tinyint(1)     default 0                 null,
    technical_support_available tinyint(1)     default 0                 null,
    technical_notes             text                                     null,
    created_at                  timestamp      default CURRENT_TIMESTAMP null,
    updated_at                  timestamp      default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_event_technical_ibfk_1
        foreign key (event_id) references rocket_production.onboarding_events (id)
            on delete cascade
);

create index event_id
    on rocket_production.onboarding_event_technical (event_id);

create index hotel_id
    on rocket_production.onboarding_events (hotel_id);

create table rocket_production.onboarding_food_beverage_details
(
    hotel_id                  int                                  not null
        primary key,
    fnb_contact_position      varchar(255)                         null,
    fnb_contact_name          varchar(255)                         null,
    fnb_contact_phone         varchar(50)                          null,
    fnb_contact_email         varchar(255)                         null,
    restaurant_name           varchar(255)                         null,
    restaurant_cuisine        varchar(255)                         null,
    restaurant_seats          int                                  null,
    restaurant_opening_hours  varchar(255)                         null,
    restaurant_exclusive      tinyint(1) default 0                 null,
    restaurant_price_minimum  decimal(10, 2)                       null,
    bar_name                  varchar(255)                         null,
    bar_seats                 int                                  null,
    bar_exclusive             tinyint(1) default 0                 null,
    bar_snacks_available      tinyint(1) default 0                 null,
    bar_opening_hours         varchar(255)                         null,
    service_times             varchar(255)                         null,
    breakfast_restaurant_name varchar(255)                         null,
    breakfast_start_time      varchar(50)                          null,
    breakfast_cost_per_person decimal(10, 2)                       null,
    breakfast_cost_per_child  decimal(10, 2)                       null,
    breakfast_event_available tinyint(1) default 0                 null,
    operational_lead_time     varchar(255)                         null,
    allergy_diet_deadline     varchar(255)                         null,
    buffet_minimum_persons    int                                  null,
    fnb_packages_available    tinyint(1) default 0                 null,
    extra_packages_customized tinyint(1) default 0                 null,
    coffee_break_items        text                                 null,
    lunch_standard_items      text                                 null,
    buffet_minimum_for_lunch  int                                  null,
    function_created_by       varchar(255)                         null,
    function_completion_time  varchar(255)                         null,
    function_required_depts   varchar(255)                         null,
    function_meeting_people   varchar(255)                         null,
    mice_desk_involvement     varchar(255)                         null,
    created_at                timestamp  default CURRENT_TIMESTAMP null,
    updated_at                timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_food_beverage_details_ibfk_1
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade
);

create table rocket_production.onboarding_hotel_info
(
    hotel_id                  int                                      not null
        primary key,
    contact_name              varchar(255)                             null,
    contact_position          varchar(255)                             null,
    contact_phone             varchar(50)                              null,
    contact_email             varchar(255)                             null,
    check_in_time             time                                     null,
    check_out_time            time                                     null,
    early_check_in_time_frame varchar(50)                              null,
    early_check_in_fee        decimal(10, 2) default 0.00              null,
    late_check_out_time       time                                     null,
    late_check_out_fee        decimal(10, 2) default 0.00              null,
    reception_hours           varchar(50)                              null,
    single_rooms              int            default 0                 null,
    double_rooms              int            default 0                 null,
    connecting_rooms          int            default 0                 null,
    accessible_rooms          int            default 0                 null,
    pets_allowed              tinyint(1)     default 0                 null,
    pet_fee                   decimal(10, 2) default 0.00              null,
    pet_inclusions            text                                     null,
    created_at                timestamp      default CURRENT_TIMESTAMP null,
    updated_at                timestamp      default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_hotel_info_ibfk_1
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade
);

create table rocket_production.onboarding_hotel_secure_data
(
    id                 int auto_increment
        primary key,
    hotel_id           int                                 not null,
    name               varchar(255)                        not null,
    username           varchar(255)                        null,
    password_encrypted varchar(1024)                       not null,
    created_at         timestamp default CURRENT_TIMESTAMP null,
    updated_at         timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_hotel_secure_data_ibfk_1
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade
);

create index hotel_id
    on rocket_production.onboarding_hotel_secure_data (hotel_id);

create index idx_onboarding_hotels_hotel_id
    on rocket_production.onboarding_hotels (system_hotel_id);

create table rocket_production.onboarding_information_policies
(
    id              int auto_increment
        primary key,
    system_hotel_id varchar(50)                                                          not null,
    type            enum ('room_information', 'service_information', 'general_policies') not null,
    created_at      timestamp default CURRENT_TIMESTAMP                                  null,
    updated_at      timestamp default CURRENT_TIMESTAMP                                  null on update CURRENT_TIMESTAMP
);

create index idx_system_hotel_id
    on rocket_production.onboarding_information_policies (system_hotel_id);

create index idx_type
    on rocket_production.onboarding_information_policies (type);

create table rocket_production.onboarding_information_policy_items
(
    id                    int auto_increment
        primary key,
    information_policy_id int                                  not null,
    title                 varchar(255)                         not null,
    is_condition          tinyint(1) default 0                 null,
    created_at            timestamp  default CURRENT_TIMESTAMP null,
    updated_at            timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_information_policy_items_ibfk_1
        foreign key (information_policy_id) references rocket_production.onboarding_information_policies (id)
            on delete cascade
);

create table rocket_production.onboarding_information_policy_item_details
(
    id                         int auto_increment
        primary key,
    information_policy_item_id int                                 not null,
    name                       varchar(255)                        not null,
    description                text                                null,
    created_at                 timestamp default CURRENT_TIMESTAMP null,
    updated_at                 timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_information_policy_item_details_ibfk_1
        foreign key (information_policy_item_id) references rocket_production.onboarding_information_policy_items (id)
            on delete cascade
);

create index idx_policy_item_id
    on rocket_production.onboarding_information_policy_item_details (information_policy_item_id);

create index idx_policy_id
    on rocket_production.onboarding_information_policy_items (information_policy_id);

create table rocket_production.onboarding_payment_methods
(
    id         int auto_increment
        primary key,
    name       varchar(255)                         not null,
    enabled    tinyint(1) default 1                 null,
    created_at timestamp  default CURRENT_TIMESTAMP null,
    updated_at timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table rocket_production.onboarding_permissions
(
    id          int auto_increment
        primary key,
    code        varchar(100) not null,
    name        varchar(100) not null,
    description text         null,
    category    varchar(50)  not null,
    constraint code
        unique (code)
);

create table rocket_production.onboarding_roles
(
    id          int auto_increment
        primary key,
    name        varchar(255)                         not null,
    description text                                 null,
    is_system   tinyint(1) default 0                 null,
    created_at  timestamp  default CURRENT_TIMESTAMP null,
    updated_at  timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint name
        unique (name)
);

create table rocket_production.onboarding_role_permissions
(
    role_id       int not null,
    permission_id int not null,
    primary key (role_id, permission_id),
    constraint onboarding_role_permissions_ibfk_1
        foreign key (role_id) references rocket_production.onboarding_roles (id)
            on delete cascade,
    constraint onboarding_role_permissions_ibfk_2
        foreign key (permission_id) references rocket_production.onboarding_permissions (id)
            on delete cascade
);

create index permission_id
    on rocket_production.onboarding_role_permissions (permission_id);

create table rocket_production.onboarding_rooms
(
    id                    int auto_increment
        primary key,
    hotel_id              int                                 not null,
    main_contact_name     varchar(255)                        null,
    main_contact_position varchar(255)                        null,
    reception_hours       varchar(255)                        null,
    created_at            timestamp default CURRENT_TIMESTAMP null,
    updated_at            timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_rooms_ibfk_1
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade
);

create table rocket_production.onboarding_room_category_infos
(
    id                      int auto_increment
        primary key,
    room_id                 int                                  not null,
    category_name           varchar(100)                         null,
    pms_name                varchar(255)                         null,
    num_rooms               int                                  null,
    size                    int                                  null,
    bed_type                varchar(255)                         null,
    surcharges_upsell       text                                 null,
    room_features           text                                 null,
    second_person_surcharge decimal(10, 2)                       null,
    extra_bed_surcharge     decimal(10, 2)                       null,
    baby_bed_available      tinyint(1) default 0                 null,
    extra_bed_available     tinyint(1) default 0                 null,
    created_at              timestamp  default CURRENT_TIMESTAMP null,
    updated_at              timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_category_infos_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_category_infos_room_id
    on rocket_production.onboarding_room_category_infos (room_id);

create table rocket_production.onboarding_room_contacts
(
    id         int auto_increment
        primary key,
    room_id    int                                 not null,
    phone      varchar(20)                         null,
    email      varchar(255)                        null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    updated_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_contacts_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_contacts_room_id
    on rocket_production.onboarding_room_contacts (room_id);

create table rocket_production.onboarding_room_inventory
(
    id                               int auto_increment
        primary key,
    room_id                          int                                 not null,
    amt_single_rooms                 int                                 null,
    amt_double_rooms                 int                                 null,
    amt_connecting_rooms             int                                 null,
    amt_handicapped_accessible_rooms int                                 null,
    created_at                       timestamp default CURRENT_TIMESTAMP null,
    updated_at                       timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_inventory_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_inventory_room_id
    on rocket_production.onboarding_room_inventory (room_id);

create table rocket_production.onboarding_room_operational_handling
(
    id                              int auto_increment
        primary key,
    room_id                         int                                  not null,
    revenue_manager_name            varchar(255)                         null,
    revenue_contact_details         varchar(255)                         null,
    demand_calendar                 tinyint(1) default 0                 null,
    demand_calendar_infos           varchar(255)                         null,
    revenue_call                    tinyint(1) default 0                 null,
    revenue_calls_infos             text                                 null,
    group_request_min_rooms         int                                  null,
    group_reservation_category      varchar(255)                         null,
    group_rates_check               tinyint(1) default 0                 null,
    group_rates                     text                                 null,
    group_handling_notes            text                                 null,
    breakfast_share                 tinyint(1) default 0                 null,
    first_second_option             tinyint(1) default 0                 null,
    shared_options                  tinyint(1) default 0                 null,
    first_option_hold_duration      varchar(255)                         null,
    overbooking                     tinyint(1) default 0                 null,
    overbooking_info                text                                 null,
    min_stay_weekends               tinyint(1) default 0                 null,
    min_stay_weekends_infos         text                                 null,
    call_off_quota                  tinyint(1) default 0                 null,
    call_off_method                 varchar(255)                         null,
    call_off_deadlines              text                                 null,
    commission_rules                text                                 null,
    free_spot_policy_leisure_groups text                                 null,
    restricted_dates                text                                 null,
    handled_by_mice_desk            tinyint(1) default 0                 null,
    mice_desk_handling_scope        text                                 null,
    requires_deposit                tinyint(1) default 0                 null,
    deposit_rules                   text                                 null,
    payment_methods_room_handling   json                                 null,
    final_invoice_handling          text                                 null,
    deposit_invoice_responsible     varchar(255)                         null,
    info_invoice_created            tinyint(1) default 0                 null,
    created_at                      timestamp  default CURRENT_TIMESTAMP null,
    updated_at                      timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_operational_handling_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_operational_handling_room_id
    on rocket_production.onboarding_room_operational_handling (room_id);

create table rocket_production.onboarding_room_pet_policies
(
    id                 int auto_increment
        primary key,
    room_id            int                                  not null,
    is_dogs_allowed    tinyint(1) default 0                 null,
    dog_fee            decimal(10, 2)                       null,
    dog_fee_inclusions text                                 null,
    created_at         timestamp  default CURRENT_TIMESTAMP null,
    updated_at         timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_pet_policies_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_pet_policies_room_id
    on rocket_production.onboarding_room_pet_policies (room_id);

create table rocket_production.onboarding_room_policies
(
    id                        int auto_increment
        primary key,
    room_id                   int                                 not null,
    check_in                  time                                null,
    check_out                 time                                null,
    early_check_in_cost       decimal(10, 2)                      null,
    late_check_out_cost       decimal(10, 2)                      null,
    early_check_in_time_frame varchar(20)                         null,
    late_check_out_time       varchar(20)                         null,
    payment_methods           json                                null,
    created_at                timestamp default CURRENT_TIMESTAMP null,
    updated_at                timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_policies_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_policies_room_id
    on rocket_production.onboarding_room_policies (room_id);

create table rocket_production.onboarding_room_standard_features
(
    id                       int auto_increment
        primary key,
    room_id                  int                                  not null,
    shower_toilet            tinyint(1) default 0                 null,
    bathtub_toilet           tinyint(1) default 0                 null,
    open_bathroom            tinyint(1) default 0                 null,
    balcony                  tinyint(1) default 0                 null,
    safe                     tinyint(1) default 0                 null,
    air_condition            tinyint(1) default 0                 null,
    heating                  tinyint(1) default 0                 null,
    hair_dryer               tinyint(1) default 0                 null,
    ironing_board            tinyint(1) default 0                 null,
    tv                       tinyint(1) default 0                 null,
    telephone                tinyint(1) default 0                 null,
    wifi                     tinyint(1) default 0                 null,
    desk                     tinyint(1) default 0                 null,
    coffee_maker             tinyint(1) default 0                 null,
    kettle                   tinyint(1) default 0                 null,
    minibar                  tinyint(1) default 0                 null,
    fridge                   tinyint(1) default 0                 null,
    allergy_friendly_bedding tinyint(1) default 0                 null,
    created_at               timestamp  default CURRENT_TIMESTAMP null,
    updated_at               timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_room_standard_features_ibfk_1
        foreign key (room_id) references rocket_production.onboarding_rooms (id)
            on delete cascade
);

create index idx_onboarding_room_standard_features_room_id
    on rocket_production.onboarding_room_standard_features (room_id);

create index idx_onboarding_rooms_hotel_id
    on rocket_production.onboarding_rooms (hotel_id);

create table rocket_production.onboarding_standard_features
(
    id         int auto_increment
        primary key,
    name       varchar(255)                        not null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    updated_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint name
        unique (name)
);

create table rocket_production.onboarding_users
(
    id         int auto_increment
        primary key,
    first_name varchar(255)                                                     not null,
    last_name  varchar(255)                                                     not null,
    email      varchar(255)                                                     not null,
    password   varchar(255)                                                     not null,
    status     enum ('active', 'pending', 'inactive') default 'pending'         not null,
    created_at timestamp                              default CURRENT_TIMESTAMP null,
    updated_at timestamp                              default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint email
        unique (email)
);

create table rocket_production.onboarding_entry_assignments
(
    id          int auto_increment
        primary key,
    entry_id    int                                                       not null,
    entry_type  enum ('hotel', 'room', 'event') default 'hotel'           not null,
    user_id     int                                                       not null,
    assigned_by int                                                       not null,
    created_at  timestamp                       default CURRENT_TIMESTAMP null,
    constraint entry_id
        unique (entry_id, entry_type, user_id),
    constraint onboarding_entry_assignments_ibfk_1
        foreign key (user_id) references rocket_production.onboarding_users (id)
            on delete cascade,
    constraint onboarding_entry_assignments_ibfk_2
        foreign key (assigned_by) references rocket_production.onboarding_users (id)
            on delete cascade
);

create index assigned_by
    on rocket_production.onboarding_entry_assignments (assigned_by);

create index user_id
    on rocket_production.onboarding_entry_assignments (user_id);

create table rocket_production.onboarding_hotel_announcements
(
    id         int auto_increment
        primary key,
    hotel_id   int                                  not null,
    message    text                                 not null,
    is_active  tinyint(1) default 1                 null,
    created_by int                                  null,
    created_at timestamp  default CURRENT_TIMESTAMP null,
    updated_at timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_hotel_announcements_ibfk_1
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade,
    constraint onboarding_hotel_announcements_ibfk_2
        foreign key (created_by) references rocket_production.onboarding_users (id)
            on delete set null
);

create index created_by
    on rocket_production.onboarding_hotel_announcements (created_by);

create index hotel_id
    on rocket_production.onboarding_hotel_announcements (hotel_id);

create table rocket_production.onboarding_pending_changes
(
    id            int auto_increment
        primary key,
    entry_id      int                                                                not null,
    entry_type    enum ('hotel', 'room', 'event')          default 'hotel'           not null,
    user_id       int                                                                not null,
    change_data   json                                                               not null,
    original_data json                                                               not null,
    status        enum ('pending', 'approved', 'rejected') default 'pending'         not null,
    reviewed_by   int                                                                null,
    review_notes  text                                                               null,
    created_at    timestamp                                default CURRENT_TIMESTAMP null,
    updated_at    timestamp                                default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint onboarding_pending_changes_ibfk_1
        foreign key (user_id) references rocket_production.onboarding_users (id)
            on delete cascade,
    constraint onboarding_pending_changes_ibfk_2
        foreign key (reviewed_by) references rocket_production.onboarding_users (id)
            on delete set null
);

create index reviewed_by
    on rocket_production.onboarding_pending_changes (reviewed_by);

create index user_id
    on rocket_production.onboarding_pending_changes (user_id);

create table rocket_production.onboarding_resource_permissions
(
    id              int auto_increment
        primary key,
    user_id         int                                       not null,
    resource_type   enum ('hotel', 'room', 'event', 'file')   not null,
    resource_id     int                                       not null,
    permission_type enum ('view', 'edit', 'delete', 'manage') not null,
    granted_by      int                                       null,
    created_at      timestamp default CURRENT_TIMESTAMP       null,
    updated_at      timestamp default CURRENT_TIMESTAMP       null on update CURRENT_TIMESTAMP,
    constraint onboarding_resource_permissions_ibfk_1
        foreign key (user_id) references rocket_production.onboarding_users (id)
            on delete cascade,
    constraint onboarding_resource_permissions_ibfk_2
        foreign key (granted_by) references rocket_production.onboarding_users (id)
            on delete set null
);

create index granted_by
    on rocket_production.onboarding_resource_permissions (granted_by);

create index user_id
    on rocket_production.onboarding_resource_permissions (user_id);

create table rocket_production.onboarding_user_all_hotels_access
(
    id          int auto_increment
        primary key,
    user_id     int                                 not null,
    assigned_by int                                 null,
    created_at  timestamp default CURRENT_TIMESTAMP null,
    updated_at  timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint user_unique
        unique (user_id),
    constraint onboarding_user_all_hotels_access_ibfk_1
        foreign key (user_id) references rocket_production.onboarding_users (id)
            on delete cascade
);

create table rocket_production.onboarding_user_hotel_assignments
(
    id          int auto_increment
        primary key,
    user_id     int                                 not null,
    hotel_id    int                                 not null,
    assigned_by int                                 null,
    created_at  timestamp default CURRENT_TIMESTAMP null,
    updated_at  timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint user_hotel_unique
        unique (user_id, hotel_id),
    constraint onboarding_user_hotel_assignments_ibfk_1
        foreign key (user_id) references rocket_production.onboarding_users (id)
            on delete cascade,
    constraint onboarding_user_hotel_assignments_ibfk_2
        foreign key (hotel_id) references rocket_production.onboarding_hotels (id)
            on delete cascade
);

create index hotel_id
    on rocket_production.onboarding_user_hotel_assignments (hotel_id);

create table rocket_production.onboarding_user_roles
(
    user_id    int                                 not null,
    role_id    int                                 not null,
    created_by int                                 null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    primary key (user_id, role_id),
    constraint onboarding_user_roles_ibfk_1
        foreign key (user_id) references rocket_production.onboarding_users (id)
            on delete cascade,
    constraint onboarding_user_roles_ibfk_2
        foreign key (role_id) references rocket_production.onboarding_roles (id)
            on delete cascade
);

create index role_id
    on rocket_production.onboarding_user_roles (role_id);

