create table planets (
 id TEXT NOT NULL PRIMARY KEY,
 title TEXT,
 aka TEXT,
 wikipedia TEXT,
 related TEXT,
 hasLife INTEGER,
 surfaceGravity INTEGER,
 diameter INTEGER,
 moons INTEGER,
 age TEXT,
 description TEXT,
 yearsToOrbitSun FLOAT,
 neighbors TEXT
);

INSERT INTO planets (id,title,aka,wikipedia,related,hasLife,surfaceGravity,diameter,moons,age,description,yearsToOrbitSun,neighbors) VALUES ("earth","Earth","Planet Earth","Earth\npageViews 123","mars & venus",true,10,12756,1,"4500000000\nIt was only during the 19th century that geologists realized Earth's age was at least many millions of years.","It's where\nwe live.",1,"Mars 110000000\nVenus 141000000");
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("jupiter",25,142984,63,11.86);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("mars",4,6794,2,1.881);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("mercury",4,4879,0,0.241);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("neptune",11,49572,14,164.79);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("saturn",9,120536,64,29.46);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("uranus",8,51118,27,84.01);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("venus",9,12104,0,0.615);