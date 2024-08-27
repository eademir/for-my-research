# for-my-research Project

## Overview
The for-my-research project is designed to fetch and process virus information from an external API. The project includes scripts and configurations to automate the retrieval and handling of virus data.

## Project Structure
- `for-my-research/`
    - `bash.sh`: A shell script to fetch virus data from the API.
    - `.gitignore`: Specifies files and directories to be ignored by Git.
    - `node_modules/`: Directory for Node.js modules.
    - `viruses/`: Directory containing unzipped virus data.
    - `virusesPNG/`: Directory containing virus images in PNG format.
    - `virusesPNGGreyscale/`: Directory containing greyscale virus images.
    - `package-lock.json`: Auto-generated file for locking dependencies.
    - `index.json`: JSON file containing the fetched virus data.

## Prerequisites
- Node.js and npm installed
- wget installed
- Bash shell

## Installation
1. Clone the repository:
    ```shell
    git clone <repository_url>
    cd for-my-research
    ```

2. Install the necessary npm packages:
    ```shell
    npm install
    ```

## Usage

### Running the Shell Script
1. Navigate to the `for-my-research` directory:
    ```shell
    cd /path/to/for-my-research
    ```

2. Make the `bash.sh` script executable (if it isn't already):
    ```shell
    chmod +x bash.sh
    ```

3. Run the script:
    ```shell
    ./bash.sh
    ```

## Script Details

### `index.ts`
- `index.ts`: This TypeScript file is the main entry point of the project. It handles the initialization and orchestration of the virus data fetching and processing tasks. It imports necessary modules, sets up configurations, and calls the appropriate functions to execute the workflow. The file typically includes:
    - Importing required modules and dependencies.
    - Reading `sha256 hashes` from `index.json`.
    - Pulling data over an HTTPS connection using the `sha256 hashes`.
    - Reading the response and unzipping the file.
    - Saving the unzipped data to the appropriate directory.
  
### `bash.sh`
- `bash.sh`: This shell script is used to fetch virus data from an external API. It prompts the user to enter a tag, uses the `wget` command to fetch data based on the provided tag, and saves the fetched data to `index.json`. The script includes:
    - Prompting the user to enter a tag.
    - Using `wget` to fetch data from the API with the specified tag.
    - Moving the resulting `index.html` file to `index.json`.

      ```shell
      #!/bin/bash
  
      # Prompt the user to enter the tag
      read -p "Enter the tag: " tag
  
      # Run the wget command with the specified tag
      wget --post-data "query=get_taginfo&tag=${tag}&limit=1000" https://mb-api.abuse.ch/api/v1/
  
      # Move the resulting index.html to index.json
      mv index.html index.json
      ```

### `bin2png`
- `bin2png`: This script converts binary virus data into PNG images. It reads the binary data files from the `viruses/` directory, processes the data, and generates corresponding PNG images, which are then saved in the `virusesPNGGreyscale/` directory. The script generally involves:
    - Reading binary data files from the specified directory.
    - Processing the binary data to convert it into image data.
    - Generating PNG images from the processed data.
    - Saving the generated PNG images to the `virusesPNGGreyscale/` directory.

### `colouredbin2png`
- `colouredbin2png`: Similar to `bin2png`, this script also converts binary virus data into PNG images. However, it applies a color scheme to the images based on certain criteria or data attributes. The resulting colored PNG images are saved in the `virusesPNG/` directory. The script typically includes:
    - Reading binary data files from the specified directory.
    - Processing the binary data to convert it into image data.
    - Applying a color scheme to the image data based on specific criteria.
    - Generating colored PNG images from the processed data.
    - Saving the generated colored PNG images to the `virusesPNG/` directory.

## .gitignore
The `.gitignore` file specifies files and directories to be ignored by Git to avoid committing unnecessary files:
```plaintext
./node_modules
./viruses.zip
./viruses
./virusesPNG
./virusesPNGGreyscale
./package-lock.json
./index.json
```

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).

## Running the Project in a Virtual Machine

To ensure the safety and security of your system, it is recommended to run this project in a virtual machine (VM) since it saves unzipped virus binaries. Below are the steps to set up and run the project in a VM.

### Prerequisites
- A virtualization software (e.g., VirtualBox, VMware)
- An operating system ISO image (e.g., Ubuntu)
- Node.js and npm installed in the VM
- wget installed in the VM
- Bash shell in the VM

### Setting Up the Virtual Machine
1. **Install Virtualization Software**: Download and install a virtualization software like VirtualBox or VMware on your host machine.

2. **Create a New Virtual Machine**:
  - Open the virtualization software and create a new VM.
  - Choose the operating system (e.g., Ubuntu) and allocate resources (CPU, RAM, disk space).

3. **Install the Operating System**:
  - Attach the OS ISO image to the VM and start the VM.
  - Follow the installation instructions to set up the OS.

4. **Install Required Software**:
  - Open a terminal in the VM and install Node.js, npm, and wget:
    ```shell
    sudo apt update
    sudo apt install nodejs npm wget -y
    ```

### Cloning and Running the Project
1. **Clone the Repository**:
    ```shell
    git clone <repository_url>
    cd for-my-research
    ```

2. **Install npm Packages**:
    ```shell
    npm install
    ```

3. **Make the `bash.sh` Script Executable**:
    ```shell
    chmod +x bash.sh
    ```

4. **Run the Script**:
    ```shell
    ./bash.sh
    ```

### Safety Precautions
- **Isolate the VM**: Ensure the VM is isolated from your host network to prevent any potential spread of malware.
- **Snapshot**: Take a snapshot of the VM before running the project. This allows you to revert to a clean state if needed.
- **Monitor Resources**: Keep an eye on the VM's resource usage to detect any unusual activity.

By following these steps, you can safely run the project in a controlled environment.

## License
This project is licensed under the MIT License.

MIT License

Copyright (c) 2024 @eademir

```plaintext
MIT License

Copyright (c) 2024 @eademir

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Disclaimer
This project is created only for research purposes. The authors and contributors are not responsible for any damage, infection, or breach that may occur as a result of using this project. Use it at your own risk and ensure you take appropriate safety measures, such as running the project in a virtual machine.