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

    # Список исключаемых директорий
    excluded_dirs = {'node_modules', '.next'}

    # Собираем конфигурационные файлы
    for config_file in config_files:
        file_path = os.path.join(project_path, config_file)
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    result.append(f"// File: {config_file}\n{content}\n\n")
            except Exception as e:
                result.append(f"// Error reading config file {config_file}: {str(e)}\n\n")

    # Список значимых расширений файлов
    significant_extensions = {
        '.ts', '.tsx',  # TypeScript файлы
        '.js', '.jsx',  # JavaScript файлы
        '.prisma',      # Prisma схемы
        '.graphql', '.gql',  # GraphQL схемы
        '.sql',         # SQL файлы
        '.css', '.scss', '.sass',  # Стили
        '.middleware.ts', '.middleware.js'  # Next.js middleware
    }

    # Функция для проверки, нужно ли исключить директорию
    def should_exclude(path):
        path_parts = path.split(os.path.sep)
        return any(excluded in path_parts for excluded in excluded_dirs)

    # Функция для рекурсивного обхода директорий
    def collect_source_files(directory):
        for root, dirs, files in os.walk(directory):
            # Пропускаем исключаемые директории
            if should_exclude(root):
                continue

            # Фильтруем исключаемые директории из списка для обхода
            dirs[:] = [d for d in dirs if d not in excluded_dirs]

            for file in files:
                file_path = os.path.join(root, file)
                extension = os.path.splitext(file)[1].lower()
                is_next_page = 'pages' in root.split(os.path.sep) and extension in {'.ts', '.tsx', '.js', '.jsx'}
                is_next_api = 'api' in root.split(os.path.sep) and extension in {'.ts', '.tsx', '.js', '.jsx'}
                is_next_component = 'components' in root.split(os.path.sep) and extension in {'.ts', '.tsx', '.js', '.jsx'}
                is_next_layout = 'app' in root.split(os.path.sep) and ('layout' in file or 'page' in file)

                # Проверяем, является ли файл значимым
                if (extension in significant_extensions or
                    is_next_page or
                    is_next_api or
                    is_next_component or
                    is_next_layout):
                    relative_path = os.path.relpath(file_path, project_path)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            result.append(f"// File: {relative_path}\n{content}\n\n")
                    except Exception as e:
                        result.append(f"// Error reading file {relative_path}: {str(e)}\n\n")

    # Собираем файлы из всего проекта
    collect_source_files(project_path)

    # Создаем output файл
    output_path = os.path.join(project_path, 'project_structure.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("// Project Structure Dump\n\n")
        f.write("".join(result))

    print(f"Project structure has been saved to {output_path}")

    # Создаем структуру проекта в формате дерева
    def generate_tree(directory, prefix=""):
        if should_exclude(directory):
            return []

        tree = []
        try:
            entries = os.listdir(directory)
        except PermissionError:
            return []

        entries = sorted(entries)
        entries = [e for e in entries if e not in excluded_dirs]

        for i, entry in enumerate(entries):
            path = os.path.join(directory, entry)
            is_last = i == len(entries) - 1

            if os.path.isfile(path):
                # Показываем только значимые файлы в дереве
                extension = os.path.splitext(entry)[1].lower()
                is_config = any(entry == config for config in config_files)
                is_next_page = 'pages' in path.split(os.path.sep) and extension in {'.ts', '.tsx', '.js', '.jsx'}
                is_next_api = 'api' in path.split(os.path.sep) and extension in {'.ts', '.tsx', '.js', '.jsx'}
                is_next_component = 'components' in path.split(os.path.sep) and extension in {'.ts', '.tsx', '.js', '.jsx'}
                is_next_layout = 'app' in path.split(os.path.sep) and ('layout' in entry or 'page' in entry)

                if (extension in significant_extensions or
                    is_config or
                    is_next_page or
                    is_next_api or
                    is_next_component or
                    is_next_layout):
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