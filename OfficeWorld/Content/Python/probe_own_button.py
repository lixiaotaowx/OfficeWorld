exec(compile(open(__file__.replace('probe_own_button.py','check_ui_pie.py'),encoding='utf-8').read(),'<runtime>','exec'))
h=widgets[0];r['bound']=h.get_editor_property('InteractButton').on_clicked.is_bound()
h.get_editor_property('InteractButton').on_clicked.broadcast()
r['after']={'seated':h.get_editor_property('Seated'),'notice':str(h.get_editor_property('NoticeText').text),'near':h.get_editor_property('NearbyIndex')}
pathlib.Path(u.Paths.project_saved_dir(),'own-button-probe.json').write_text(json.dumps(r,indent=2))
