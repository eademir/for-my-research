#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "lodepng.h"
#include <dirent.h>
#include <sys/stat.h>
#include <string.h>
#include <pthread.h>
#include <stdbool.h>
#include <stdint.h>

void *binaryToPng(void *args);

typedef struct {
    char inputFile[1024];
    char outputFile[1024];
} FilePaths;

typedef struct QueueNode {
    FilePaths *data;
    struct QueueNode *next;
} QueueNode;

typedef struct {
    QueueNode *front;
    QueueNode *rear;
} Queue;

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
Queue fileQueue = {NULL, NULL};
int done = 0;

void enqueue(Queue *q, FilePaths *data) {
    QueueNode *newNode = (QueueNode *)malloc(sizeof(QueueNode));
    if (newNode == NULL) {
        perror("Failed to allocate memory for new node");
        exit(EXIT_FAILURE);
    }
    newNode->data = data;
    newNode->next = NULL;
    if (q->rear == NULL) {
        q->front = q->rear = newNode;
    } else {
        q->rear->next = newNode;
        q->rear = newNode;
    }
}

FilePaths *dequeue(Queue *q) {
    if (q->front == NULL) return NULL;
    QueueNode *temp = q->front;
    FilePaths *data = temp->data;
    q->front = q->front->next;
    if (q->front == NULL) q->rear = NULL;
    free(temp);
    return data;
}

void *threadFunction() {
    while (true) {
        pthread_mutex_lock(&mutex);
        while (fileQueue.front == NULL && !done) {
            pthread_cond_wait(&cond, &mutex);
        }
        if (done && fileQueue.front == NULL) {
            pthread_mutex_unlock(&mutex);
            break;
        }
        FilePaths *paths = dequeue(&fileQueue);
        pthread_mutex_unlock(&mutex);

        if (paths != NULL) {
            intptr_t result = (intptr_t)binaryToPng((void *)paths);
            if (result == 1) {
                fprintf(stderr, "Error processing file: %s\n", paths->inputFile);
            }
        }
    }
    return NULL;
}

int main() {
    struct dirent *entry;
    struct stat fileStat;
    DIR *dir = opendir("/viruses");

    if (dir == NULL) {
        perror("opendir");
        return EXIT_FAILURE;
    }

    // Create virusesPNG directory if it does not exist
    struct stat st = {0};
    if (stat("/virusesPNG", &st) == -1) {
        mkdir("/virusesPNG", 0700);
    }

    // Create thread pool
    pthread_t threads[20];
    for (int i = 0; i < 20; i++) {
        pthread_create(&threads[i], NULL, threadFunction, NULL);
    }

    while ((entry = readdir(dir)) != NULL) {
        char filePath[1024];
        snprintf(filePath, sizeof(filePath), "/viruses/%s", entry->d_name);

        if (stat(filePath, &fileStat) == 0 && S_ISREG(fileStat.st_mode)) {
            char outputFile[1024];
            snprintf(outputFile, sizeof(outputFile), "for-my-research/virusesPNG/%s.png", entry->d_name);

            FilePaths *paths = (FilePaths *)malloc(sizeof(FilePaths));
            if (paths == NULL) {
                perror("Failed to allocate memory for file paths");
                exit(EXIT_FAILURE);
            }
            strcpy(paths->inputFile, filePath);
            strcpy(paths->outputFile, outputFile);

            pthread_mutex_lock(&mutex);
            enqueue(&fileQueue, paths);
            pthread_cond_signal(&cond);
            pthread_mutex_unlock(&mutex);

            // Free memory
            free(paths);
        }
    }

    closedir(dir);

    // Signal threads to finish
    pthread_mutex_lock(&mutex);
    done = 1;
    pthread_cond_broadcast(&cond);
    pthread_mutex_unlock(&mutex);

    // Wait for all threads to finish
    for (int i = 0; i < 20; i++) {
        pthread_join(threads[i], NULL);
    }

    return EXIT_SUCCESS;
}

// Convert a binary file to PNG
void *binaryToPng(void *args) {
    FilePaths *paths = (FilePaths *)args;
    const char *inputFile = paths->inputFile;
    const char *outputFile = paths->outputFile;

    FILE *binaryFile;
    unsigned long fileSize;
    unsigned char *fileBuff;
    unsigned char *pngData;
    unsigned int imageSize;
    unsigned int i, x, y, error;

    // Open binary file
    binaryFile = fopen(inputFile, "rb");
    if(binaryFile == NULL) {
        printf("Error reading '%s' file.\n", inputFile);
        free(paths);
        return (void *)1;
    }

    // Get file length
    fseek(binaryFile, 0, SEEK_END);
    fileSize = ftell(binaryFile);
    fseek(binaryFile, 0, SEEK_SET);

    // Allocate memory for the file buffer
    fileBuff = (unsigned char *)malloc(fileSize);
    if (fileBuff == NULL) {
        perror("Failed to allocate memory for file buffer");
        fclose(binaryFile);
        free(paths);
        return (void *)1;
    }

    // Get final image size (fileSize / 3 because each pixel will use 3 bytes)
    imageSize = (unsigned int)ceil(sqrt((double) fileSize / 3));

    // Print various information
    printf("Size of file : %lu bytes\n", fileSize);
    printf("Size of final image : %u x %u px\n", imageSize, imageSize);
    puts("\n");

    // Allocate memory for the PNG data array
    pngData = (unsigned char *) malloc(imageSize * imageSize * 4);
    if (pngData == NULL) {
        perror("Failed to allocate memory for PNG data");
        free(fileBuff);
        fclose(binaryFile);
        free(paths);
        return (void *)1;
    }

    // Read binary file to buffer
    fread(fileBuff, fileSize, 1, binaryFile);

    puts("Starting conversion to PNG file...");

    x = 0;
    y = 0;
    // Process each 3 bytes, add pixel to pngData array
    for(i = 0; i < fileSize; i += 3) {
        // Set pixel data
        pngData[4 * imageSize * y + 4 * x + 0] = fileBuff[i];     // R
        pngData[4 * imageSize * y + 4 * x + 1] = fileBuff[i + 1]; // G
        pngData[4 * imageSize * y + 4 * x + 2] = fileBuff[i + 2]; // B
        pngData[4 * imageSize * y + 4 * x + 3] = 255;             // A

        x += 1;

        // When reached end of pixels line, go to next one
        if(x == imageSize) {
            x = 0;
            y += 1;
        }
    }

    // Complete the image with red pixels if necessary
    while(x < imageSize && y < imageSize || y < imageSize) {
        pngData[4 * imageSize * y + 4 * x + 0] = 255; // R
        pngData[4 * imageSize * y + 4 * x + 1] = 0;   // G
        pngData[4 * imageSize * y + 4 * x + 2] = 0;   // B
        pngData[4 * imageSize * y + 4 * x + 3] = 255; // A

        x += 1;

        // When reached end of pixels line, go to next one
        if(x == imageSize) {
            x = 0;
            y += 1;
        }
    }

    printf("Writing PNG file to : %s\n", outputFile);

    // Write PNG file
    error = lodepng_encode32_file(outputFile, pngData, imageSize, imageSize);

    // Free memory
    free(pngData);
    free(fileBuff);
    fclose(binaryFile);

    if(error) {
        printf("error %u: %s\n", error, lodepng_error_text(error));
        return (void *)1;
    } else {
        puts("Success !");
        return (void *)0;
    }
}