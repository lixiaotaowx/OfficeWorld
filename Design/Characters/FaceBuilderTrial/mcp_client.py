import socket,json,sys,pathlib
payload={'type':'execute_code','params':{'code':pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')}}
with socket.create_connection(('127.0.0.1',9876),5) as s:
    s.settimeout(25)
    s.sendall(json.dumps(payload).encode())
    data=b''
    while True:
        chunk=s.recv(65536)
        if not chunk:break
        data+=chunk
        try:
            result=json.loads(data)
            print(json.dumps(result,ensure_ascii=True))
            break
        except json.JSONDecodeError:pass
