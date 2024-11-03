import os
import json
from pathlib import Path

def collect_project_structure(project_path):
    result = []

    # Список файлов конфигурации, которые нужно собрать
    config_files = [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        '.env',
        '.env.local',
        '.gitignore',
        'tailwind.config.js',
        'postcss.config.js'
    ]

    # Собираем конфигурационные файлы
    for config_file in config_files:
        file_path = os.path.join(project_path, config_file)
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                result.append(f"// File: {config_file}\n{content}\n\n")

    # Функция для рекурсивного обхода директорий
    def collect_source_files(directory):
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.prisma')):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, project_path)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            result.append(f"// File: {relative_path}\n{content}\n\n")
                    except Exception as e:
                        result.append(f"// Error reading file {relative_path}: {str(e)}\n\n")

    # Собираем файлы из src директории
    src_path = os.path.join(project_path, 'src')
    if os.path.exists(src_path):
        collect_source_files(src_path)

    # Собираем файлы из prisma директории
    prisma_path = os.path.join(project_path, 'prisma')
    if os.path.exists(prisma_path):
        collect_source_files(prisma_path)

    # Создаем output файл
    output_path = os.path.join(project_path, 'project_structure.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("// Project Structure Dump\n\n")
        f.write("".join(result))

    print(f"Project structure has been saved to {output_path}")

    # Создаем структуру проекта в формате дерева
    def generate_tree(directory, prefix=""):
        tree = []
        entries = os.listdir(directory)
        entries = [e for e in entries if not e.startswith('.') and e != 'node_modules']
        entries.sort()

        for i, entry in enumerate(entries):
            path = os.path.join(directory, entry)
            is_last = i == len(entries) - 1

            if os.path.isfile(path):
                tree.append(f"{prefix}{'└── ' if is_last else '├── '}{entry}")
            else:
                tree.append(f"{prefix}{'└── ' if is_last else '├── '}{entry}/")
                tree.extend(generate_tree(path, prefix + ('    ' if is_last else '│   ')))

        return tree

    # Сохраняем структуру проекта
    tree_structure = generate_tree(project_path)
    tree_output_path = os.path.join(project_path, 'project_tree.txt')
    with open(tree_output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(tree_structure))

    print(f"Project tree structure has been saved to {tree_output_path}")

# Пример использования:
if __name__ == "__main__":
    project_path = input("Enter the path to your Next.js project: ").strip()
    if not project_path:
        project_path = "."  # Текущая директория по умолчанию

    if os.path.exists(project_path):
        collect_project_structure(project_path)
    else:
        print(f"Error: Directory {project_path} does not exist!")