from pathlib import Path
p=Path('OfficeWorld/Content/Python/test_office_interaction.py')
s=p.read_text(encoding='utf-8')
if 'def run_office_regression():' not in s:
 lines=s.splitlines()
 p.write_text('\n'.join(lines[:2])+'\ndef run_office_regression():\n'+'\n'.join(' '+x for x in lines[2:])+'\nrun_office_regression()\n',encoding='utf-8')
