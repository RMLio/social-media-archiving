#
# author: Sven Lieber
# Ghent University - imec - IDLab
#
# This script is a temporary solution to apply a workaround for https://github.com/RMLio/yarrrml-parser/issues/124
#

from rdflib import Graph
import csv
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from pprint import pprint
from optparse import OptionParser
import os


def main():

  parser = OptionParser(usage="usage: %prog [options]")
  parser.add_option('-i', '--input-file', action='store', help='The input RML file which should be fixed')
  parser.add_option('-o', '--output-file', action='store', help='The file in which the fixed RML should be stored')
  (options, args) = parser.parse_args()
  if not options.input_file or not options.output_file:
    parser.print_help();
    exit(1)

  g = Graph()

  if options.input_file.endswith('nt'):
    g.parse(options.input_file, format='nt')
  elif options.input_file.endswith('ttl'):
    g.parse(options.input_file, format='turtle')
  elif options.input_file.endswith('owl'):
    g.parse(options.input_file, format='turtle')
  elif options.input_file.endswith('n3'):
    g.parse(options.input_file, format='n3')

  updateQuery = """
PREFIX rml: <http://semweb.mmlab.be/ns/rml#> 
PREFIX rr: <http://www.w3.org/ns/r2rml#> 
PREFIX rmlt: <http://semweb.mmlab.be/ns/rml-target#> 

INSERT { 
 ?subjectMap rml:logicalTarget ?logicalTarget .
} 
WHERE { 
?logicalTarget a rmlt:LogicalTarget . 
?subjectMap a rr:SubjectMap .
}
"""

  g.update(updateQuery)
  g.serialize(destination=options.output_file, format='turtle')

main()
