package main

import (
	"fmt"
)

func main() {
	fmt.Printf("hello world\n")
	radius := "sdffd"

	fmt.Printf("\033[91m[Log #1733855811219] radius: %v\033[0m\n", radius)

	fmt.Printf("\033[93m[Log #1733855809853] radius: %v\033[0m\n", radius)

	fmt.Printf("\033[97m[Log #1733855808182] radius: %v\033[0m\n", radius)
}
