cid_map
=======

This project involved creating a map showing where voters are located in proximity to Columbia's Community Improvement Districts (CIDs).

Dependencies
------------

*	[Python 2.7 +](https://www.python.org/ "Python 2.7"): An interpreted, object-oriented, high-level programming language
*	[PostgreSQL 9.3 +](http://www.postgresql.org/ "PostgreSQL"): An open source object-relational database system
*	[psycopg2](http://initd.org/psycopg/ "psycopg2"): For connecting Python to Postgres
*	[peewee](https://peewee.readthedocs.org/en/latest/): A simple object-relational mapper (ORM)
*	[requests](http://docs.python-requests.org/en/latest/ "requests"): For handling HTTP request, in this case to the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)

Set up
------

First you need to set up a local PostgreSQL database:

	$ psql
	# CREATE DATABASE [name of your database];
	# \q

Then run [db_setup.py](https://github.com/gordonje/cid_map/blob/master/db_setup.py):

	$ python db_setup.py [name of your database] [your Postgres user name] [your Postgres password]

Which will...

1.	Create any missing database tables, whereas each class is defined in [models.py](https://github.com/gordonje/cid_map/blob/master/models.py) (other than BaseModel) maps to a table in the database, and the attributes for the classes map to columns on those tables. When we eventually instantiate objects of these classes, those objects become rows in the data tables.
2.	Clean and import voter records from VRTAPE01KBIA_W_HEADERS.CSV (not included) if they haven't already been imported.

Note that the Postgres database user you specify will also need read permissions on the .csv file. So if you're logging into the database with the "postgres" role, this might be a problem. You could either manual set the permissions on the file to allow "Everyone" to read them or, better yet, create a new database role for your user account (Note that this might require you to run 'createdb' from the terminal if your PostgreSQL installation process did not set up a default database for the user OS user account).

Geocoding
---------

You'll need your own Google Maps API key, which should be saved in file called config.py like this:
	# api_key = '[your Google Maps API key]'

Then run [get_geocodes.py](https://github.com/gordonje/cid_map/blob/master/get_geocodes.py):

	$ python get_geocodes.py [name of your database] [your Postgres user name] [your Postgres password]

Which will requests geocodes for each Columbia city voter whose address has not been geocoded.

