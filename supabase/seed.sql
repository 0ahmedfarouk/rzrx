insert into products(name,price,active) values
('بريميام بوت',100,true),
('مولد بوتات سريع',250,true),
('خدمة بروتكاست',75,true)
on conflict do nothing;