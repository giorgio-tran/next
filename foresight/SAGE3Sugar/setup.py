from setuptools import setup, find_packages

with open('requirements.txt') as f:
    requirements = f.read().splitlines()
    
setup(
    name='Sage3Sugar',
    version='1.0',
    packages=find_packages(),
    install_requires=requirements,
    author='Mahdi',
    description='Sage3 Python API',
    url='https://github.com/SAGE-3/next',
)
