from models import *
from csv import DictReader
from peewee import SelectQuery

db.create_tables([
				  Voter
				, Voter_Geocode
				, Voter_History
			], True)

voter_count = SelectQuery(Voter).count()

if voter_count < 121795:

	print '   Importing voter records...'


	with open('VRTAPE01KBIA_W_HEADERS.CSV') as in_file:

		reader = DictReader(in_file)

		for row in reader:

			if row['vr_dob'] == '0':
				row['vr_dob'] = None
			else:
				row['birth_year'] = row['vr_dob'][:4]
				if len(row['vr_dob']) < 8:
					row['vr_dob'] = None
				elif row['vr_dob'][4:6] == '00' or row['vr_dob'][6:] == '00':
					row['vr_dob'] = None
				elif row['vr_dob'][:4] == '9999':
					row['vr_dob'] = None
				else:
					row['vr_dob'] = row['vr_dob'][:4] + '-' + row['vr_dob'][4:6] + '-' + row['vr_dob'][6:]

			for k, v in row.iteritems():
				if v == '':
					row[k] = None

			with db.atomic():
				Voter.create(**row)
