from models import *
from csv import DictReader

election_types = [
	  'GENERAL'
	, 'PRIMARY'
	, 'SPECIAL'
	, 'PRESIDENTIAL'
]

with open('voting_history.tsv') as in_file:

	reader = DictReader(in_file, dialect = 'excel-tab')

	for row in reader:

		with db.atomic():
			Voter_History.create(
				  voter = row['VRIDNUM']
				, month = row['ELECTION YEAR/MONTH'][4:6]
				, year = row['ELECTION YEAR/MONTH'][0:4]
				, election_type = row['ELECTION']
			)