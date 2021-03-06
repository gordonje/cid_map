
from getpass import getpass
from sys import argv
from peewee import *
from playhouse.postgres_ext import *

########## Set up database connection ##########

try:
	db_name = argv[1]
except IndexError:
	db_name = raw_input('Enter db name:')
try:
	db_user = argv[2]
except IndexError:
	db_user = raw_input('Enter db user name:')
try:
	db_password = argv[3]
except IndexError:
	db_password = getpass('Enter db user password:')

db = PostgresqlExtDatabase(db_name, user=db_user, password=db_password, register_hstore=False)
db.connect()

################################################

class BaseModel(Model):
	class Meta:
		database = db


class Voter(BaseModel):
	vr_id = IntegerField(primary_key = True)
	stvr_id = IntegerField()
	vr_cid = IntegerField()
	l_name = CharField()
	f_name = CharField(null = True)
	m_name = CharField(null = True)
	vr_name = CharField()
	vr_nsfx = CharField(null = True)
	vr_dob = DateField(null = True)
	birth_year = IntegerField(null = True)
	vr_housno = IntegerField()
	vr_dir = CharField(null = True)
	vr_street = CharField(null = True)
	vr_kind = CharField(null = True)
	vr_suffix = CharField(null = True)
	vr_apt = CharField(null = True)
	vr_add2 = CharField(null = True)
	vr_zipa = CharField()
	res_cty_st = CharField(null = True)
	mail_add1 = CharField(null = True)
	mail_add2 = CharField(null = True)
	mail_cty_st = CharField(null = True)
	mail_zip1 = CharField(null = True)
	vr_pct = CharField()

	class Meta:
		db_table = 'voters'


class Voter_Geocode(BaseModel):
	voter = ForeignKeyField(Voter, related_name = 'geocodes')
	service = CharField()
	status = CharField()
	lat = DoubleField(null = True)
	lng = DoubleField(null = True)
	location_type = CharField(null = True)
	street_number = CharField(null = True) 
	route = CharField(null = True)
	locality = CharField(null = True)
	administrative_area_level_3 = CharField(null = True)
	administrative_area_level_2 = CharField(null = True)
	administrative_area_level_1 = CharField(null = True) 
	postal_code = CharField(null = True) 
	postal_code_suffix = CharField(null = True)
	country = CharField(null = True)
	formatted_address = CharField(null = True)
	viewport_ne_lat = DoubleField(null = True)
	viewport_ne_lng = DoubleField(null = True)
	viewport_sw_lat = DoubleField(null = True)
	viewport_sw_lng = DoubleField(null = True)
	partial_match = BooleanField()
	json_results = JSONField()

	class Meta:
		db_table = 'voters_geocodes'
		indexes = (
			(('voter', 'service'), True),
		)


class Voter_History(BaseModel):
	voter = ForeignKeyField(Voter, related_name = 'voter_history')
	month = IntegerField()
	year = IntegerField()
	election_type = CharField()

	class Meta:
		indexes = (
			(('voter', 'month', 'year'), True),
		)