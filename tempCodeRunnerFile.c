#include <stdio.h>

//iterative factorial code 

int factorial(int n){
    if(n<0){
        printf("Input must be positive or zero");
        return -1;
    }else if(n == 0){
        return 1;
    }else{
        int calc=1;   
        for(int i=0; i == n; i++){
            return calc = calc*i;
        }
    }
}
