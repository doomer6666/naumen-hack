package postgres

import (
	"context"
	"fmt"

	"nau/auth/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	User     string `envconfig:"DB_USER"`
	Password string `envconfig:"DB_PASSWORD"`
	Host     string `envconfig:"DB_HOST"`
	Port     string `envconfig:"DB_PORT"`
	DBName   string `envconfig:"DB_NAME"`
}

type Pool struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, c Config) (*Pool, error) {
	const op = "postgres.New"

	DBURL := fmt.Sprintf(
    "postgres://%s:%s@%s:%s/%s?sslmode=disable&connect_timeout=5",
    c.User, c.Password, c.Host, c.Port, c.DBName)

	pool, err := pgxpool.New(ctx, DBURL)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to pool: %s: %w", op, err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("unable to ping pool: %s, %w", op, err)
	}

	return &Pool{pool}, nil
}

// Implement CRUD

func (p *Pool) CreateUser(
	ctx context.Context,
	name domain.Name,
	role,
	team,
	passwordHash string,
	email domain.Email,
) (uuid.UUID, error) {
	const op = "postgres.CreateUser"

	sql := `
	INSERT INTO users(name, role, team, password_hash, email)
	VALUES($1, $2, $3, $4, $5)
	RETURNING id
	`

	var id uuid.UUID

	err := p.pool.QueryRow(ctx, sql, name, role, team, passwordHash, email).Scan(&id)
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("unable to create user: %s: %w", op, err)
	}

	return id, nil
}

func (p *Pool) ReadUser(ctx context.Context, email domain.Email) (domain.User, error) {
	const op = "postgres.ReadUser"

	sql := `SELECT * FROM users WHERE email = $1`

	var user domain.User

	err := p.pool.QueryRow(ctx, sql, email).
		Scan(
			&user.ID,
			&user.Name,
			&user.Role,
			&user.Team,
			&user.PasswordHash,
			&user.Email,
			&user.CreatedAt,
		)
	if err != nil {
		return user, fmt.Errorf("unable to read info about user: %s: %w", op, err)
	}
	return user, nil
}

func (p *Pool) UpdateUser(ctx context.Context,
	id uuid.UUID,
	name domain.Name,
	role,
	team,
	passwordHash string,
	email domain.Email,
) error {
	const op = "postgres.UpdateUser"

	sql := `
	UPDATE users
	SET name = $2,
		role = $3,
		team = $4,
		password_hash = $5,
		email = $6
	WHERE id = $1
	`

	tag, err := p.pool.Exec(ctx, sql, id, name, role, team, email)
	if err != nil {
		return fmt.Errorf("unable to update user: %s: %w", op, err)
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("user not found: %s: %w", op, err)
	}

	return nil
}

func (p *Pool) DeleteUser(ctx context.Context, id uuid.UUID) error {
	const op = "postgres.DeleteUser"

	sql := `DELETE * FROM users WHERE id = $1`

	tag, err := p.pool.Exec(ctx, sql, id)
	if err != nil {
		return fmt.Errorf("unable to delete user: %s: %w", op, err)
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("user not found: %s: %w", op, err)
	}

	return nil
}

func (p *Pool) GetUserPassword(ctx context.Context, email domain.Email) (string, error) {
	const op = "postgres.GetUserPassword"

	sql := `SELECT password_hash FROM users WHERE id = $1`

	var passwordHash string

	err := p.pool.QueryRow(ctx, sql, email).Scan(&passwordHash)
	if err != nil {
		return "", fmt.Errorf("unable to get password hash: %s: %w", op, err)
	}

	return passwordHash, nil
}

func (p *Pool) Close() {
	p.pool.Close()
}

func (p *Pool) ReadUserByID(ctx context.Context, id uuid.UUID) (domain.User, error) {
	const op = "postgres.ReadUserByID"

	sql := `SELECT id, name, role, team, password_hash, email, created_at FROM users WHERE id = $1`

	var user domain.User

	err := p.pool.QueryRow(ctx, sql, id).
		Scan(
			&user.ID,
			&user.Name,
			&user.Role,
			&user.Team,
			&user.PasswordHash,
			&user.Email,
			&user.CreatedAt,
		)
	if err != nil {
		return user, fmt.Errorf("unable to read user by id: %s: %w", op, err)
	}
	return user, nil
}