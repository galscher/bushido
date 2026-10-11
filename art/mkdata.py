import json,os
H=os.path.dirname(os.path.abspath(__file__))
man=json.load(open(os.path.join(H,'manifest.json')))
open(os.path.join(H,'..','art_data.js'),'w').write('const ART_DATA='+json.dumps(man,separators=(',',':'))+';\n')
print('ids',list(man))
