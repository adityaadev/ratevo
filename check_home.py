with open('client/src/pages/Home.jsx', 'r') as f:
    content = f.read()

idx = content.find('<Step number="1"')
if idx >= 0:
    print(content[idx:idx+500])