import os
import re

files = [
    'Dashboard.tsx', 'Students.tsx', 'Teachers.tsx', 'Courses.tsx', 
    'Attendance.tsx', 'Results.tsx', 'Fees.tsx', 'Chat.tsx', 'Settings.tsx'
]

cwd = os.getcwd()
pages_dir = os.path.join(cwd, 'src', 'pages')

for file_name in files:
    path = os.path.join(pages_dir, file_name)
    if not os.path.exists(path): 
        print(f"Not found: {path}")
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Ensure motion is imported
    if 'import { motion }' not in content:
        content = 'import { motion } from "framer-motion";\n' + content

    # 2. Fix the top and bottom tags to match
    # Strip any broken motion.div tags and revert them
    content = content.replace('<motion.div', '<div')
    content = content.replace('</motion.div>', '</div>')
    
    # Remove the animation props that we might have partially applied to standard divs
    content = re.sub(r'\s*initial=\{\{[^\}]+\}\}\s*animate=\{\{[^\}]+\}\}\s*transition=\{\{[^\}]+\}\}', '', content)
    
    # 3. Apply the motion.div wrapper
    # Find the top-most JSX return which looks like: return ( \n <div className="space-y-
    pattern = r'(return\s*\(\s*)<div(\s+className="space-y-[^"]+"[^>]*)>'
    match = re.search(pattern, content)
    
    if match:
        original_opening_tag = match.group(0) # return ( <div className="space-y-6">
        # We need to replace ONLY the `<div` part
        
        replacement = original_opening_tag.replace('<div', '<motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      transition={{ duration: 0.5 }}', 1)
        
        content = content.replace(original_opening_tag, replacement, 1)
        
        # Now find the last </div> in the file (just before the final `); }`)
        # Usually it's \n    </div>\n  );\n}
        last_div_index = content.rfind('</div>')
        if last_div_index != -1:
            content = content[:last_div_index] + '</motion.div>' + content[last_div_index+6:]
            
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Processed {file_name}')
    else:
        print(f'Failed to match pattern in {file_name}')
