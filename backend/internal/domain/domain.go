package domain

import (
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type (
	Name  string
	Email string
)

type User struct {
	ID           uuid.UUID `db:"id"`
	Name         Name      `db:"name"`
	Role         string    `db:"role"`
	Team         string    `db:"team"`
	PasswordHash string    `db:"password_hash"`
	Email        Email     `db:"email"`
	CreatedAt    time.Time `db:"created_at"`
}

var validate = validator.New(validator.WithRequiredStructEnabled())

func NewUser(name, role, team, passwordHash, email string) (User, error) {
	u := User{
		ID:           uuid.New(),
		Name:         Name(name),
		Role:         role,
		Team:         team,
		PasswordHash: passwordHash,
		Email:        Email(email),
	}

	if err := u.Validate(); err != nil {
		return User{}, fmt.Errorf("p.Validate: %w", err)
	}

	return u, nil
}

func (u User) Validate() error {
	err := validate.Struct(u)
	if err != nil {
		return fmt.Errorf("validate.Struct: %w", err)
	}

	return nil
}
