create table planets (
 id TEXT NOT NULL PRIMARY KEY,
 surfaceGravity INTEGER,
 diameter INTEGER,
 moons INTEGER,
 yearsToOrbitSun FLOAT
);

INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("earth",10,12756,1,1);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("jupiter",25,142984,63,11.86);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("mars",4,6794,2,1.881);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("mercury",4,4879,0,0.241);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("neptune",11,49572,14,164.79);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("saturn",9,120536,64,29.46);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("uranus",8,51118,27,84.01);
INSERT INTO planets (id,surfaceGravity,diameter,moons,yearsToOrbitSun) VALUES ("venus",9,12104,0,0.615);